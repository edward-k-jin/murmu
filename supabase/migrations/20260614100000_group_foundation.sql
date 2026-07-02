create type public.group_plan as enum ('free', 'paid');
create type public.group_status as enum ('active', 'closed');
create type public.group_member_role as enum ('admin', 'member');
create type public.group_membership_status as enum ('active', 'left', 'removed');

create table public.groups (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  admin_user_id uuid not null references public.profiles(user_id) on delete restrict,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  client_request_id uuid not null,
  plan public.group_plan not null default 'free',
  member_limit integer not null default 2 check (member_limit = 2),
  status public.group_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint groups_pair_member_limit_check check (member_limit = 2),
  constraint groups_closed_state_check check (
    (status = 'closed' and closed_at is not null)
    or (status = 'active' and closed_at is null)
  ),
  unique (created_by, client_request_id)
);

create index groups_admin_user_id_idx on public.groups (admin_user_id);

create table public.group_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  role public.group_member_role not null,
  status public.group_membership_status not null default 'active',
  join_request_id uuid,
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  ended_by uuid references public.profiles(user_id) on delete set null,
  constraint group_memberships_ended_state_check check (
    (status = 'active' and ended_at is null and ended_by is null)
    or (status <> 'active' and ended_at is not null)
  )
);

create unique index group_memberships_one_active_user_idx
  on public.group_memberships (group_id, user_id)
  where status = 'active';

create unique index group_memberships_one_active_admin_idx
  on public.group_memberships (group_id)
  where role = 'admin' and status = 'active';

create unique index group_memberships_join_request_idx
  on public.group_memberships (user_id, join_request_id)
  where join_request_id is not null;

create index group_memberships_user_active_idx
  on public.group_memberships (user_id, joined_at desc)
  where status = 'active';

create index group_memberships_group_active_idx
  on public.group_memberships (group_id, user_id)
  where status = 'active';

create table public.group_invites (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  code_hash text not null unique,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint group_invites_expiry_check check (expires_at > created_at)
);

create index group_invites_group_id_idx on public.group_invites (group_id);
create index group_invites_created_by_idx on public.group_invites (created_by);
create index group_invites_active_idx
  on public.group_invites (group_id, expires_at)
  where revoked_at is null;

alter table public.groups enable row level security;
alter table public.groups force row level security;
alter table public.group_memberships enable row level security;
alter table public.group_memberships force row level security;
alter table public.group_invites enable row level security;
alter table public.group_invites force row level security;

revoke all on public.groups from anon, authenticated;
revoke all on public.group_memberships from anon, authenticated;
revoke all on public.group_invites from anon, authenticated;

create or replace function private.is_active_group_member(
  target_group_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_memberships gm
    join public.groups g on g.id = gm.group_id
    where gm.group_id = target_group_id
      and gm.user_id = target_user_id
      and gm.status = 'active'
      and g.status = 'active'
  );
$$;

create or replace function private.is_group_admin(
  target_group_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_memberships gm
    join public.groups g on g.id = gm.group_id
    where gm.group_id = target_group_id
      and gm.user_id = target_user_id
      and gm.role = 'admin'
      and gm.status = 'active'
      and g.status = 'active'
  );
$$;

revoke all on function private.is_active_group_member(uuid, uuid) from public, anon;
revoke all on function private.is_group_admin(uuid, uuid) from public, anon;
grant execute on function private.is_active_group_member(uuid, uuid) to authenticated;
grant execute on function private.is_group_admin(uuid, uuid) to authenticated;

create policy groups_select_active_member
  on public.groups
  for select
  to authenticated
  using ((select private.is_active_group_member(id)));

create policy group_memberships_select_active_group
  on public.group_memberships
  for select
  to authenticated
  using ((select private.is_active_group_member(group_id)));

create policy group_invites_select_admin
  on public.group_invites
  for select
  to authenticated
  using ((select private.is_group_admin(group_id)));

grant select on public.groups to authenticated;
grant select on public.group_memberships to authenticated;
grant select on public.group_invites to authenticated;

create or replace function public.create_group(
  p_name text,
  p_client_request_id uuid
)
returns table (
  group_id uuid,
  group_name text,
  member_role text,
  active_member_count integer,
  member_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_group_id uuid;
  clean_name text := btrim(p_name);
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not exists (select 1 from public.profiles where user_id = current_user_id) then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;
  if p_client_request_id is null or char_length(clean_name) not between 1 and 30 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  select g.id
  into target_group_id
  from public.groups g
  where g.created_by = current_user_id
    and g.client_request_id = p_client_request_id;

  if target_group_id is null then
    insert into public.groups (
      name,
      admin_user_id,
      created_by,
      client_request_id
    ) values (
      clean_name,
      current_user_id,
      current_user_id,
      p_client_request_id
    )
    returning id into target_group_id;

    insert into public.group_memberships (group_id, user_id, role)
    values (target_group_id, current_user_id, 'admin');
  end if;

  return query
  select g.id, g.name, 'admin'::text, 1, g.member_limit
  from public.groups g
  where g.id = target_group_id;
end;
$$;

create or replace function public.create_group_invite(p_group_id uuid)
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
  raw_code text;
  invite_expiry timestamptz := now() + interval '24 hours';
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_group_admin(p_group_id, current_user_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_ADMIN';
  end if;

  update public.group_invites gi
  set revoked_at = now()
  where gi.group_id = p_group_id
    and gi.revoked_at is null
    and gi.expires_at > now();

  raw_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));

  insert into public.group_invites (group_id, code_hash, created_by, expires_at)
  values (
    p_group_id,
    encode(extensions.digest(lower(raw_code), 'sha256'), 'hex'),
    current_user_id,
    invite_expiry
  );

  return query select raw_code, 'murmu://group-invite/' || raw_code, invite_expiry;
end;
$$;

create or replace function public.list_my_groups()
returns table (
  group_id uuid,
  group_name text,
  member_role text,
  active_member_count integer,
  member_limit integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    g.id,
    g.name,
    gm.role::text,
    (
      select count(*)::integer
      from public.group_memberships active_gm
      where active_gm.group_id = g.id
        and active_gm.status = 'active'
    ),
    g.member_limit
  from public.group_memberships gm
  join public.groups g on g.id = gm.group_id
  where gm.user_id = (select auth.uid())
    and gm.status = 'active'
    and g.status = 'active'
  order by gm.joined_at desc;
$$;

create or replace function public.get_group_members(p_group_id uuid)
returns table (
  user_id uuid,
  nickname text,
  member_role text,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_active_group_member(p_group_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;

  return query
  select gm.user_id, p.nickname, gm.role::text, gm.joined_at
  from public.group_memberships gm
  join public.profiles p on p.user_id = gm.user_id
  where gm.group_id = p_group_id
    and gm.status = 'active'
  order by gm.joined_at, gm.id;
end;
$$;

create or replace function public.preview_group_invite(p_code text)
returns table (
  state text,
  group_name text,
  admin_nickname text,
  active_member_count integer,
  member_limit integer,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invite_row public.group_invites%rowtype;
  target_group public.groups%rowtype;
  current_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  select * into invite_row
  from public.group_invites
  where code_hash = encode(extensions.digest(lower(btrim(p_code)), 'sha256'), 'hex');

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::integer, null::integer, null::timestamptz;
    return;
  end if;
  if invite_row.revoked_at is not null then
    return query select 'revoked'::text, null::text, null::text, null::integer, null::integer, invite_row.expires_at;
    return;
  end if;
  if invite_row.expires_at <= now() then
    return query select 'expired'::text, null::text, null::text, null::integer, null::integer, invite_row.expires_at;
    return;
  end if;

  select * into target_group from public.groups where id = invite_row.group_id;
  if target_group.status <> 'active' then
    return query select 'invalid'::text, null::text, null::text, null::integer, null::integer, invite_row.expires_at;
    return;
  end if;

  if exists (
    select 1 from public.group_memberships gm
    where gm.group_id = invite_row.group_id
      and gm.user_id = current_user_id
      and gm.status = 'active'
  ) then
    return query
    select 'already_joined'::text, target_group.name, p.nickname, null::integer, target_group.member_limit, invite_row.expires_at
    from public.profiles p where p.user_id = target_group.admin_user_id;
    return;
  end if;

  select count(*)::integer into current_count
  from public.group_memberships gm
  where gm.group_id = invite_row.group_id and gm.status = 'active';

  return query
  select
    case when current_count >= target_group.member_limit then 'full' else 'valid' end,
    target_group.name,
    p.nickname,
    current_count,
    target_group.member_limit,
    invite_row.expires_at
  from public.profiles p
  where p.user_id = target_group.admin_user_id;
end;
$$;

create or replace function public.accept_group_invite(
  p_code text,
  p_client_request_id uuid
)
returns table (
  group_id uuid,
  group_name text,
  member_role text,
  active_member_count integer,
  member_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invite_row public.group_invites%rowtype;
  target_group public.groups%rowtype;
  current_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not exists (select 1 from public.profiles where user_id = current_user_id) then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;
  if p_client_request_id is null then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  select g.* into target_group
  from public.group_memberships gm
  join public.groups g on g.id = gm.group_id
  where gm.user_id = current_user_id
    and gm.join_request_id = p_client_request_id;

  if found then
    select count(*)::integer into current_count
    from public.group_memberships gm
    where gm.group_id = target_group.id and gm.status = 'active';

    return query select target_group.id, target_group.name, 'member'::text, current_count, target_group.member_limit;
    return;
  end if;

  select * into invite_row
  from public.group_invites
  where code_hash = encode(extensions.digest(lower(btrim(p_code)), 'sha256'), 'hex')
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'INVITE_INVALID';
  end if;
  if invite_row.revoked_at is not null then
    raise exception using errcode = 'P0001', message = 'INVITE_REVOKED';
  end if;
  if invite_row.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'INVITE_EXPIRED';
  end if;

  select * into target_group
  from public.groups
  where id = invite_row.group_id
  for update;

  if target_group.status <> 'active' then
    raise exception using errcode = 'P0001', message = 'GROUP_NOT_FOUND';
  end if;
  if exists (
    select 1 from public.group_memberships gm
    where gm.group_id = target_group.id
      and gm.user_id = current_user_id
      and gm.status = 'active'
  ) then
    raise exception using errcode = 'P0001', message = 'ALREADY_GROUP_MEMBER';
  end if;

  select count(*)::integer into current_count
  from public.group_memberships gm
  where gm.group_id = target_group.id and gm.status = 'active';

  if current_count >= target_group.member_limit then
    raise exception using errcode = 'P0001', message = 'GROUP_MEMBER_LIMIT_REACHED';
  end if;

  insert into public.group_memberships (
    group_id,
    user_id,
    role,
    join_request_id
  ) values (
    target_group.id,
    current_user_id,
    'member',
    p_client_request_id
  );

  return query
  select target_group.id, target_group.name, 'member'::text, current_count + 1, target_group.member_limit;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns table (
  group_id uuid,
  membership_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  membership_row public.group_memberships%rowtype;
  active_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  perform id from public.groups where id = p_group_id for update;

  select gm.* into membership_row
  from public.group_memberships gm
  where gm.group_id = p_group_id
    and gm.user_id = current_user_id
    and gm.status = 'active'
  for update of gm;

  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;

  select count(*)::integer into active_count
  from public.group_memberships gm
  where gm.group_id = p_group_id and gm.status = 'active';

  if membership_row.role = 'admin' and active_count > 1 then
    raise exception using errcode = 'P0001', message = 'ADMIN_CANNOT_LEAVE_WITH_MEMBERS';
  end if;

  update public.group_memberships
  set status = 'left', ended_at = now(), ended_by = current_user_id
  where id = membership_row.id;

  if membership_row.role = 'admin' then
    update public.groups
    set status = 'closed', closed_at = now(), updated_at = now()
    where id = p_group_id;
  end if;

  return query select p_group_id, 'left'::text;
end;
$$;

create or replace function public.remove_group_member(
  p_group_id uuid,
  p_target_user_id uuid
)
returns table (
  group_id uuid,
  target_user_id uuid,
  membership_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_membership public.group_memberships%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_group_admin(p_group_id, current_user_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_ADMIN';
  end if;

  perform id from public.groups where id = p_group_id for update;

  select gm.* into target_membership
  from public.group_memberships gm
  where gm.group_id = p_group_id
    and gm.user_id = p_target_user_id
    and gm.status = 'active'
  for update of gm;

  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;
  if target_membership.role = 'admin' then
    raise exception using errcode = 'P0001', message = 'CANNOT_REMOVE_ADMIN';
  end if;

  update public.group_memberships
  set status = 'removed', ended_at = now(), ended_by = current_user_id
  where id = target_membership.id;

  return query select p_group_id, p_target_user_id, 'removed'::text;
end;
$$;

revoke all on function public.create_group(text, uuid) from public;
revoke all on function public.list_my_groups() from public;
revoke all on function public.get_group_members(uuid) from public;
revoke all on function public.create_group_invite(uuid) from public;
revoke all on function public.preview_group_invite(text) from public;
revoke all on function public.accept_group_invite(text, uuid) from public;
revoke all on function public.leave_group(uuid) from public;
revoke all on function public.remove_group_member(uuid, uuid) from public;

grant execute on function public.create_group(text, uuid) to authenticated;
grant execute on function public.list_my_groups() to authenticated;
grant execute on function public.get_group_members(uuid) to authenticated;
grant execute on function public.create_group_invite(uuid) to authenticated;
grant execute on function public.preview_group_invite(text) to authenticated;
grant execute on function public.accept_group_invite(text, uuid) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;
