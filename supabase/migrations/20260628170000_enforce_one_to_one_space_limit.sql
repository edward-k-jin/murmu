update public.groups
set member_limit = 2,
    updated_at = now()
where member_limit <> 2;

alter table public.groups
  alter column member_limit set default 2;

alter table public.groups
  drop constraint if exists groups_free_member_limit_check;

alter table public.groups
  drop constraint if exists groups_pair_member_limit_check;

alter table public.groups
  drop constraint if exists groups_member_limit_check;

alter table public.groups
  add constraint groups_member_limit_check check (member_limit = 2);
