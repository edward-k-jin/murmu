create extension if not exists pgcrypto with schema extensions;

create type public.couple_status as enum ('pending', 'active', 'disconnected');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  birth_date date,
  timezone text not null check (char_length(timezone) between 1 and 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default extensions.gen_random_uuid(),
  status public.couple_status not null default 'pending',
  created_at timestamptz not null default now(),
  disconnected_at timestamptz,
  constraint couples_disconnected_state_check check (
    (status = 'disconnected' and disconnected_at is not null)
    or (status <> 'disconnected' and disconnected_at is null)
  )
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (couple_id, user_id),
  constraint couple_members_left_after_joined_check check (
    left_at is null or left_at >= joined_at
  )
);

create unique index couple_members_one_active_couple_idx
  on public.couple_members (user_id)
  where left_at is null;

create index couple_members_active_lookup_idx
  on public.couple_members (couple_id, user_id)
  where left_at is null;

create table public.couple_invites (
  id uuid primary key default extensions.gen_random_uuid(),
  code_hash text not null unique,
  couple_id uuid not null references public.couples(id) on delete cascade,
  inviter_id uuid not null references public.profiles(user_id) on delete cascade,
  expires_at timestamptz not null,
  accepted_by uuid references public.profiles(user_id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint couple_invites_resolution_check check (
    (accepted_at is null and accepted_by is null)
    or (accepted_at is not null and accepted_by is not null)
  )
);

create index couple_invites_couple_id_idx on public.couple_invites (couple_id);
create index couple_invites_inviter_id_idx on public.couple_invites (inviter_id);
create index couple_invites_active_idx
  on public.couple_invites (inviter_id, expires_at)
  where accepted_at is null and revoked_at is null;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.couples enable row level security;
alter table public.couples force row level security;
alter table public.couple_members enable row level security;
alter table public.couple_members force row level security;
alter table public.couple_invites enable row level security;
alter table public.couple_invites force row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.couples from anon, authenticated;
revoke all on public.couple_members from anon, authenticated;
revoke all on public.couple_invites from anon, authenticated;

create or replace function public.is_active_couple_member(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.couple_members cm
    join public.couples c on c.id = cm.couple_id
    where cm.couple_id = target_couple_id
      and cm.user_id = (select auth.uid())
      and cm.left_at is null
      and c.status in ('pending', 'active')
  );
$$;

revoke all on function public.is_active_couple_member(uuid) from public;
grant execute on function public.is_active_couple_member(uuid) to authenticated;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy couples_select_member
  on public.couples
  for select
  to authenticated
  using ((select public.is_active_couple_member(id)));

create policy couple_members_select_same_couple
  on public.couple_members
  for select
  to authenticated
  using ((select public.is_active_couple_member(couple_id)));

create policy couple_invites_select_inviter
  on public.couple_invites
  for select
  to authenticated
  using (inviter_id = (select auth.uid()));

grant select on public.profiles to authenticated;
grant select on public.couples to authenticated;
grant select on public.couple_members to authenticated;
grant select on public.couple_invites to authenticated;

create or replace function public.upsert_profile(
  p_nickname text,
  p_birth_date date,
  p_timezone text
)
returns table (
  user_id uuid,
  nickname text,
  birth_date date,
  timezone text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  clean_nickname text := btrim(p_nickname);
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if char_length(clean_nickname) not between 1 and 20 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  if p_timezone is null or char_length(p_timezone) not between 1 and 64 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  insert into public.profiles as p (user_id, nickname, birth_date, timezone)
  values (current_user_id, clean_nickname, p_birth_date, p_timezone)
  on conflict on constraint profiles_pkey do update
    set nickname = excluded.nickname,
        birth_date = excluded.birth_date,
        timezone = excluded.timezone,
        updated_at = now();

  return query
  select p.user_id, p.nickname, p.birth_date, p.timezone
  from public.profiles p
  where p.user_id = current_user_id;
end;
$$;

create or replace function public.create_invite()
returns table (
  code text,
  deep_link text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_couple_id uuid;
  member_count integer;
  raw_code text;
  invite_expiry timestamptz := now() + interval '24 hours';
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if not exists (select 1 from public.profiles where user_id = current_user_id) then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;

  select cm.couple_id
  into target_couple_id
  from public.couple_members cm
  join public.couples c on c.id = cm.couple_id
  where cm.user_id = current_user_id
    and cm.left_at is null
    and c.status in ('pending', 'active')
  for update of c, cm;

  if target_couple_id is not null then
    select count(*)
    into member_count
    from public.couple_members
    where couple_id = target_couple_id and left_at is null;

    if member_count > 1 then
      raise exception using errcode = 'P0001', message = 'ALREADY_PAIRED';
    end if;
  else
    insert into public.couples default values returning id into target_couple_id;
    insert into public.couple_members (couple_id, user_id)
    values (target_couple_id, current_user_id);
  end if;

  update public.couple_invites
  set revoked_at = now()
  where inviter_id = current_user_id
    and accepted_at is null
    and revoked_at is null;

  raw_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));

  insert into public.couple_invites (
    code_hash,
    couple_id,
    inviter_id,
    expires_at
  ) values (
    encode(extensions.digest(lower(raw_code), 'sha256'), 'hex'),
    target_couple_id,
    current_user_id,
    invite_expiry
  );

  return query select raw_code, 'murmu://invite/' || raw_code, invite_expiry;
end;
$$;

create or replace function public.preview_invite(invite_code text)
returns table (
  state text,
  inviter_nickname text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invite_row public.couple_invites%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  select *
  into invite_row
  from public.couple_invites
  where code_hash = encode(extensions.digest(lower(btrim(invite_code)), 'sha256'), 'hex');

  if not found or invite_row.revoked_at is not null then
    return query select 'invalid'::text, null::text, null::timestamptz;
    return;
  end if;

  if invite_row.inviter_id = current_user_id then
    return query select 'self'::text, null::text, invite_row.expires_at;
    return;
  end if;

  if invite_row.accepted_at is not null then
    return query select 'used'::text, null::text, invite_row.expires_at;
    return;
  end if;

  if invite_row.expires_at <= now() then
    return query select 'expired'::text, null::text, invite_row.expires_at;
    return;
  end if;

  if exists (
    select 1
    from public.couple_members cm
    join public.couples c on c.id = cm.couple_id
    where cm.user_id = current_user_id
      and cm.left_at is null
    and c.status in ('pending', 'active')
  ) then
    return query select 'already_paired'::text, null::text, invite_row.expires_at;
    return;
  end if;

  return query
  select 'valid'::text, p.nickname, invite_row.expires_at
  from public.profiles p
  where p.user_id = invite_row.inviter_id;
end;
$$;

create or replace function public.accept_invite(invite_code text)
returns table (
  couple_id uuid,
  partner_user_id uuid,
  partner_nickname text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invite_row public.couple_invites%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if not exists (select 1 from public.profiles where user_id = current_user_id) then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;

  select *
  into invite_row
  from public.couple_invites
  where code_hash = encode(extensions.digest(lower(btrim(invite_code)), 'sha256'), 'hex')
  for update;

  if not found or invite_row.revoked_at is not null then
    raise exception using errcode = 'P0001', message = 'INVITE_INVALID';
  end if;
  if invite_row.inviter_id = current_user_id then
    raise exception using errcode = 'P0001', message = 'INVITE_SELF';
  end if;
  if invite_row.accepted_at is not null then
    raise exception using errcode = 'P0001', message = 'INVITE_USED';
  end if;
  if invite_row.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'INVITE_EXPIRED';
  end if;

  perform user_id
  from public.profiles
  where user_id in (current_user_id, invite_row.inviter_id)
  order by user_id
  for update;

  if exists (
    select 1
    from public.couple_members cm
    join public.couples c on c.id = cm.couple_id
    where cm.user_id = current_user_id
      and cm.left_at is null
      and c.status in ('pending', 'active')
  ) then
    raise exception using errcode = 'P0001', message = 'ALREADY_PAIRED';
  end if;

  if (
    select count(*)
    from public.couple_members cm
    where cm.couple_id = invite_row.couple_id and cm.left_at is null
  ) <> 1 then
    raise exception using errcode = 'P0001', message = 'CONFLICT';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (invite_row.couple_id, current_user_id);

  update public.couples
  set status = 'active'
  where id = invite_row.couple_id and status = 'pending';

  if not found then
    raise exception using errcode = 'P0001', message = 'CONFLICT';
  end if;

  update public.couple_invites
  set accepted_by = current_user_id,
      accepted_at = now()
  where id = invite_row.id;

  return query
  select invite_row.couple_id, invite_row.inviter_id, p.nickname
  from public.profiles p
  where p.user_id = invite_row.inviter_id;
end;
$$;

revoke all on function public.upsert_profile(text, date, text) from public;
revoke all on function public.create_invite() from public;
revoke all on function public.preview_invite(text) from public;
revoke all on function public.accept_invite(text) from public;

grant execute on function public.upsert_profile(text, date, text) to authenticated;
grant execute on function public.create_invite() to authenticated;
grant execute on function public.preview_invite(text) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
