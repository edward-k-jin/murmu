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
