begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

insert into auth.users (id, email, is_sso_user, is_anonymous)
values
  ('00000000-0000-0000-0000-000000000001', 'one@murmu.local', false, false),
  ('00000000-0000-0000-0000-000000000002', 'two@murmu.local', false, false),
  ('00000000-0000-0000-0000-000000000003', 'third@murmu.local', false, false);

insert into public.profiles (user_id, nickname, timezone)
values
  ('00000000-0000-0000-0000-000000000001', '하나', 'Asia/Seoul'),
  ('00000000-0000-0000-0000-000000000002', '둘', 'Asia/Seoul'),
  ('00000000-0000-0000-0000-000000000003', '셋', 'Asia/Seoul');

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'couples', 'couples table exists');
select has_table('public', 'couple_members', 'couple_members table exists');
select has_table('public', 'couple_invites', 'couple_invites table exists');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

select is(
  (select count(*) from public.profiles),
  1::bigint,
  'authenticated user sees only their own full profile'
);

select is(
  (select nickname from public.profiles),
  '하나'::text,
  'authenticated user cannot read another profile through the full profile table'
);

select lives_ok(
  $$select * from public.create_invite()$$,
  'an unpaired profiled user can create an invite'
);

select is(
  (select count(*) from public.couples),
  1::bigint,
  'invite creator can read their pending couple'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);

select is(
  (select count(*) from public.couples),
  0::bigint,
  'unrelated user cannot read another pending couple'
);

select is(
  (select count(*) from public.couple_invites),
  0::bigint,
  'unrelated user cannot read another invite'
);

select * from finish();
rollback;

