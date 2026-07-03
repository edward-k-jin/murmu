create type public.monologue_publish_mode as enum ('immediate', 'scheduled');
create type public.monologue_status as enum ('scheduled', 'published', 'cancelled', 'deleted');

create table public.group_mood_checkins (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  local_date date not null,
  timezone text not null check (char_length(timezone) between 1 and 64),
  mood_code text not null check (char_length(btrim(mood_code)) between 1 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, user_id, local_date)
);

create index group_mood_checkins_user_id_idx on public.group_mood_checkins (user_id);
create index group_mood_checkins_group_date_idx on public.group_mood_checkins (group_id, local_date);

create table public.monologues (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete restrict,
  client_request_id uuid not null,
  mood_code text not null check (char_length(btrim(mood_code)) between 1 and 32),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  publish_mode public.monologue_publish_mode not null,
  status public.monologue_status not null,
  scheduled_for timestamptz,
  published_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, client_request_id),
  constraint monologues_publication_state_check check (
    (status = 'scheduled' and publish_mode = 'scheduled' and scheduled_for is not null and published_at is null and cancelled_at is null)
    or (status = 'published' and published_at is not null and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null)
    or (status = 'deleted')
  )
);

create index monologues_author_id_idx on public.monologues (author_id);
create index monologues_group_feed_idx
  on public.monologues (group_id, created_at desc, id desc)
  where status in ('scheduled', 'published');
create index monologues_due_publication_idx
  on public.monologues (scheduled_for, id)
  where status = 'scheduled';

create table public.monologue_thread_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  monologue_id uuid not null references public.monologues(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete restrict,
  client_request_id uuid not null,
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now(),
  unique (sender_id, client_request_id)
);

create index monologue_thread_messages_group_id_idx on public.monologue_thread_messages (group_id);
create index monologue_thread_messages_sender_id_idx on public.monologue_thread_messages (sender_id);
create index monologue_thread_messages_feed_idx
  on public.monologue_thread_messages (monologue_id, created_at, id);

alter table public.group_mood_checkins enable row level security;
alter table public.group_mood_checkins force row level security;
alter table public.monologues enable row level security;
alter table public.monologues force row level security;
alter table public.monologue_thread_messages enable row level security;
alter table public.monologue_thread_messages force row level security;

revoke all on public.group_mood_checkins from anon, authenticated;
revoke all on public.monologues from anon, authenticated;
revoke all on public.monologue_thread_messages from anon, authenticated;

create or replace function public.upsert_group_mood(
  p_group_id uuid,
  p_local_date date,
  p_timezone text,
  p_mood_code text
)
returns table (
  mood_id uuid,
  group_id uuid,
  local_date date,
  mood_code text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_row public.group_mood_checkins%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_active_group_member(p_group_id, current_user_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;
  if p_local_date is null
    or char_length(btrim(p_timezone)) not between 1 and 64
    or char_length(btrim(p_mood_code)) not between 1 and 32 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  insert into public.group_mood_checkins (group_id, user_id, local_date, timezone, mood_code)
  values (p_group_id, current_user_id, p_local_date, btrim(p_timezone), btrim(p_mood_code))
  on conflict on constraint group_mood_checkins_group_id_user_id_local_date_key
  do update set
    timezone = excluded.timezone,
    mood_code = excluded.mood_code,
    updated_at = now()
  returning * into target_row;

  return query select target_row.id, target_row.group_id, target_row.local_date, target_row.mood_code, target_row.updated_at;
end;
$$;

drop function public.get_group_members(uuid);

create function public.get_group_members(
  p_group_id uuid,
  p_local_date date default null
)
returns table (
  user_id uuid,
  nickname text,
  member_role text,
  joined_at timestamptz,
  today_mood text
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
  select gm.user_id, p.nickname, gm.role::text, gm.joined_at, mood.mood_code
  from public.group_memberships gm
  join public.profiles p on p.user_id = gm.user_id
  left join public.group_mood_checkins mood
    on mood.group_id = gm.group_id
    and mood.user_id = gm.user_id
    and mood.local_date = coalesce(p_local_date, (now() at time zone p.timezone)::date)
  where gm.group_id = p_group_id
    and gm.status = 'active'
  order by gm.joined_at, gm.id;
end;
$$;

create or replace function public.create_monologue(
  p_group_id uuid,
  p_client_request_id uuid,
  p_mood_code text,
  p_body text,
  p_publish_mode public.monologue_publish_mode,
  p_scheduled_for timestamptz default null
)
returns table (
  monologue_id uuid,
  group_id uuid,
  monologue_status text,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_row public.monologues%rowtype;
  clean_body text := btrim(p_body);
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_active_group_member(p_group_id, current_user_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;
  if p_client_request_id is null
    or char_length(btrim(p_mood_code)) not between 1 and 32
    or char_length(clean_body) not between 1 and 10000
    or p_publish_mode is null
    or (p_publish_mode = 'scheduled' and (p_scheduled_for is null or p_scheduled_for <= now() or p_scheduled_for > now() + interval '7 days'))
    or (p_publish_mode = 'immediate' and p_scheduled_for is not null) then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  select * into target_row
  from public.monologues m
  where m.author_id = current_user_id
    and m.client_request_id = p_client_request_id;

  if not found then
    insert into public.monologues (
      group_id,
      author_id,
      client_request_id,
      mood_code,
      body,
      publish_mode,
      status,
      scheduled_for,
      published_at
    ) values (
      p_group_id,
      current_user_id,
      p_client_request_id,
      btrim(p_mood_code),
      clean_body,
      p_publish_mode,
      case when p_publish_mode = 'immediate' then 'published'::public.monologue_status else 'scheduled'::public.monologue_status end,
      p_scheduled_for,
      case when p_publish_mode = 'immediate' then now() else null end
    )
    returning * into target_row;
  elsif target_row.group_id <> p_group_id then
    raise exception using errcode = 'P0001', message = 'CONFLICT';
  end if;

  return query
  select target_row.id, target_row.group_id, target_row.status::text,
    target_row.scheduled_for, target_row.published_at, target_row.created_at;
end;
$$;

create or replace function public.get_scheduled_monologue(p_monologue_id uuid)
returns table (
  monologue_id uuid,
  group_id uuid,
  mood_code text,
  body text,
  scheduled_for timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  return query
  select m.id, m.group_id, m.mood_code, m.body, m.scheduled_for, m.created_at, m.updated_at
  from public.monologues m
  where m.id = p_monologue_id
    and m.author_id = current_user_id
    and m.status = 'scheduled'
    and (select private.is_active_group_member(m.group_id, current_user_id));

  if not found then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_EDITABLE';
  end if;
end;
$$;

create or replace function public.update_scheduled_monologue(
  p_monologue_id uuid,
  p_mood_code text,
  p_body text,
  p_scheduled_for timestamptz
)
returns table (
  monologue_id uuid,
  monologue_status text,
  scheduled_for timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_row public.monologues%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if char_length(btrim(p_mood_code)) not between 1 and 32
    or char_length(btrim(p_body)) not between 1 and 10000
    or p_scheduled_for is null
    or p_scheduled_for <= now()
    or p_scheduled_for > now() + interval '7 days' then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  update public.monologues m
  set mood_code = btrim(p_mood_code),
      body = btrim(p_body),
      scheduled_for = p_scheduled_for,
      updated_at = now()
  where m.id = p_monologue_id
    and m.author_id = current_user_id
    and m.status = 'scheduled'
    and (select private.is_active_group_member(m.group_id, current_user_id))
  returning * into target_row;

  if not found then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_EDITABLE';
  end if;

  return query select target_row.id, target_row.status::text, target_row.scheduled_for, target_row.updated_at;
end;
$$;

create or replace function public.cancel_scheduled_monologue(p_monologue_id uuid)
returns table (
  monologue_id uuid,
  monologue_status text,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_row public.monologues%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  update public.monologues m
  set status = 'cancelled',
      cancelled_at = now(),
      cancel_reason = 'author_cancelled',
      updated_at = now()
  where m.id = p_monologue_id
    and m.author_id = current_user_id
    and m.status = 'scheduled'
    and (select private.is_active_group_member(m.group_id, current_user_id))
  returning * into target_row;

  if not found then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_EDITABLE';
  end if;

  return query select target_row.id, target_row.status::text, target_row.cancelled_at;
end;
$$;

create or replace function public.list_group_feed(
  p_group_id uuid,
  p_limit integer default 30,
  p_before_created_at timestamptz default null,
  p_before_id uuid default null
)
returns table (
  monologue_id uuid,
  author_id uuid,
  author_nickname text,
  author_is_active boolean,
  mood_code text,
  monologue_status text,
  body text,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz,
  thread_count integer
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
  if p_limit not between 1 and 100
    or ((p_before_created_at is null) <> (p_before_id is null)) then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;

  return query
  select
    m.id,
    m.author_id,
    p.nickname,
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = m.group_id and gm.user_id = m.author_id and gm.status = 'active'
    ),
    m.mood_code,
    m.status::text,
    case when m.status = 'published' then m.body else null end,
    m.scheduled_for,
    m.published_at,
    m.created_at,
    (select count(*)::integer from public.monologue_thread_messages t where t.monologue_id = m.id)
  from public.monologues m
  join public.profiles p on p.user_id = m.author_id
  where m.group_id = p_group_id
    and m.status in ('scheduled', 'published')
    and (
      p_before_created_at is null
      or (m.created_at, m.id) < (p_before_created_at, p_before_id)
    )
  order by m.created_at desc, m.id desc
  limit p_limit;
end;
$$;

create or replace function public.get_published_monologue(
  p_group_id uuid,
  p_monologue_id uuid
)
returns table (
  monologue_id uuid,
  author_id uuid,
  author_nickname text,
  author_is_active boolean,
  mood_code text,
  body text,
  published_at timestamptz,
  created_at timestamptz
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
  select
    m.id,
    m.author_id,
    p.nickname,
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = m.group_id and gm.user_id = m.author_id and gm.status = 'active'
    ),
    m.mood_code,
    m.body,
    m.published_at,
    m.created_at
  from public.monologues m
  join public.profiles p on p.user_id = m.author_id
  where m.id = p_monologue_id
    and m.group_id = p_group_id
    and m.status = 'published';

  if not found then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_PUBLISHED';
  end if;
end;
$$;

create or replace function public.send_thread_message(
  p_group_id uuid,
  p_monologue_id uuid,
  p_client_request_id uuid,
  p_body text
)
returns table (
  message_id uuid,
  monologue_id uuid,
  sender_id uuid,
  body text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_row public.monologue_thread_messages%rowtype;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if not (select private.is_active_group_member(p_group_id, current_user_id)) then
    raise exception using errcode = 'P0001', message = 'NOT_GROUP_MEMBER';
  end if;
  if p_client_request_id is null or char_length(btrim(p_body)) not between 1 and 5000 then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;
  if not exists (
    select 1 from public.monologues m
    where m.id = p_monologue_id and m.group_id = p_group_id and m.status = 'published'
  ) then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_PUBLISHED';
  end if;

  select * into target_row
  from public.monologue_thread_messages t
  where t.sender_id = current_user_id and t.client_request_id = p_client_request_id;

  if not found then
    insert into public.monologue_thread_messages (group_id, monologue_id, sender_id, client_request_id, body)
    values (p_group_id, p_monologue_id, current_user_id, p_client_request_id, btrim(p_body))
    returning * into target_row;
  elsif target_row.group_id <> p_group_id or target_row.monologue_id <> p_monologue_id then
    raise exception using errcode = 'P0001', message = 'CONFLICT';
  end if;

  return query select target_row.id, target_row.monologue_id, target_row.sender_id, target_row.body, target_row.created_at;
end;
$$;

create or replace function public.list_thread_messages(
  p_group_id uuid,
  p_monologue_id uuid,
  p_limit integer default 100,
  p_after_created_at timestamptz default null,
  p_after_id uuid default null
)
returns table (
  message_id uuid,
  sender_id uuid,
  sender_nickname text,
  sender_is_active boolean,
  body text,
  created_at timestamptz
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
  if p_limit not between 1 and 100
    or ((p_after_created_at is null) <> (p_after_id is null)) then
    raise exception using errcode = 'P0001', message = 'VALIDATION_FAILED';
  end if;
  if not exists (
    select 1 from public.monologues m
    where m.id = p_monologue_id and m.group_id = p_group_id and m.status = 'published'
  ) then
    raise exception using errcode = 'P0001', message = 'MONOLOGUE_NOT_PUBLISHED';
  end if;

  return query
  select
    t.id,
    t.sender_id,
    p.nickname,
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = t.group_id and gm.user_id = t.sender_id and gm.status = 'active'
    ),
    t.body,
    t.created_at
  from public.monologue_thread_messages t
  join public.profiles p on p.user_id = t.sender_id
  where t.group_id = p_group_id
    and t.monologue_id = p_monologue_id
    and (
      p_after_created_at is null
      or (t.created_at, t.id) > (p_after_created_at, p_after_id)
    )
  order by t.created_at, t.id
  limit p_limit;
end;
$$;

create or replace function public.publish_due_monologues(p_batch_time timestamptz default now())
returns table (
  published_count integer,
  cancelled_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  published_total integer;
  cancelled_total integer;
begin
  with cancelled as (
    update public.monologues m
    set status = 'cancelled',
        cancelled_at = p_batch_time,
        cancel_reason = 'membership_ended',
        updated_at = p_batch_time
    where m.status = 'scheduled'
      and m.scheduled_for <= p_batch_time
      and not (select private.is_active_group_member(m.group_id, m.author_id))
    returning 1
  )
  select count(*)::integer into cancelled_total from cancelled;

  with published as (
    update public.monologues m
    set status = 'published',
        published_at = p_batch_time,
        updated_at = p_batch_time
    where m.status = 'scheduled'
      and m.scheduled_for <= p_batch_time
      and (select private.is_active_group_member(m.group_id, m.author_id))
    returning 1
  )
  select count(*)::integer into published_total from published;

  return query select published_total, cancelled_total;
end;
$$;

drop function public.leave_group(uuid);

create function public.leave_group(p_group_id uuid)
returns table (
  group_id uuid,
  membership_status text,
  cancelled_scheduled_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  membership_row public.group_memberships%rowtype;
  active_count integer;
  cancelled_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  perform id from public.groups where id = p_group_id for update;

  select gm.* into membership_row
  from public.group_memberships gm
  where gm.group_id = p_group_id and gm.user_id = current_user_id and gm.status = 'active'
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

  update public.monologues m
  set status = 'cancelled', cancelled_at = now(), cancel_reason = 'membership_ended', updated_at = now()
  where m.group_id = p_group_id and m.author_id = current_user_id and m.status = 'scheduled';
  get diagnostics cancelled_count = row_count;

  if membership_row.role = 'admin' then
    update public.groups
    set status = 'closed', closed_at = now(), updated_at = now()
    where id = p_group_id;
  end if;

  return query select p_group_id, 'left'::text, cancelled_count;
end;
$$;

drop function public.remove_group_member(uuid, uuid);

create function public.remove_group_member(
  p_group_id uuid,
  p_target_user_id uuid
)
returns table (
  group_id uuid,
  target_user_id uuid,
  membership_status text,
  cancelled_scheduled_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_membership public.group_memberships%rowtype;
  cancelled_count integer;
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
  where gm.group_id = p_group_id and gm.user_id = p_target_user_id and gm.status = 'active'
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

  update public.monologues m
  set status = 'cancelled', cancelled_at = now(), cancel_reason = 'membership_ended', updated_at = now()
  where m.group_id = p_group_id and m.author_id = p_target_user_id and m.status = 'scheduled';
  get diagnostics cancelled_count = row_count;

  return query select p_group_id, p_target_user_id, 'removed'::text, cancelled_count;
end;
$$;

revoke all on function public.upsert_group_mood(uuid, date, text, text) from public;
revoke all on function public.get_group_members(uuid, date) from public;
revoke all on function public.create_monologue(uuid, uuid, text, text, public.monologue_publish_mode, timestamptz) from public;
revoke all on function public.get_scheduled_monologue(uuid) from public;
revoke all on function public.update_scheduled_monologue(uuid, text, text, timestamptz) from public;
revoke all on function public.cancel_scheduled_monologue(uuid) from public;
revoke all on function public.list_group_feed(uuid, integer, timestamptz, uuid) from public;
revoke all on function public.get_published_monologue(uuid, uuid) from public;
revoke all on function public.send_thread_message(uuid, uuid, uuid, text) from public;
revoke all on function public.list_thread_messages(uuid, uuid, integer, timestamptz, uuid) from public;
revoke all on function public.publish_due_monologues(timestamptz) from public;
revoke all on function public.leave_group(uuid) from public;
revoke all on function public.remove_group_member(uuid, uuid) from public;

grant execute on function public.upsert_group_mood(uuid, date, text, text) to authenticated;
grant execute on function public.get_group_members(uuid, date) to authenticated;
grant execute on function public.create_monologue(uuid, uuid, text, text, public.monologue_publish_mode, timestamptz) to authenticated;
grant execute on function public.get_scheduled_monologue(uuid) to authenticated;
grant execute on function public.update_scheduled_monologue(uuid, text, text, timestamptz) to authenticated;
grant execute on function public.cancel_scheduled_monologue(uuid) to authenticated;
grant execute on function public.list_group_feed(uuid, integer, timestamptz, uuid) to authenticated;
grant execute on function public.get_published_monologue(uuid, uuid) to authenticated;
grant execute on function public.send_thread_message(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.list_thread_messages(uuid, uuid, integer, timestamptz, uuid) to authenticated;
grant execute on function public.publish_due_monologues(timestamptz) to service_role;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;
