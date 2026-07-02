begin;

create extension if not exists pgtap with schema extensions;

select plan(34);

insert into auth.users (id, email, is_sso_user, is_anonymous)
values
  ('10000000-0000-0000-0000-000000000001', 'admin@murmu.local', false, false),
  ('10000000-0000-0000-0000-000000000002', 'member@murmu.local', false, false),
  ('10000000-0000-0000-0000-000000000003', 'third@murmu.local', false, false),
  ('10000000-0000-0000-0000-000000000007', 'unrelated@murmu.local', false, false);

insert into public.profiles (user_id, nickname, timezone)
values
  ('10000000-0000-0000-0000-000000000001', '관리자', 'Asia/Seoul'),
  ('10000000-0000-0000-0000-000000000002', '멤버', 'Asia/Seoul'),
  ('10000000-0000-0000-0000-000000000003', '셋', 'Asia/Seoul'),
  ('10000000-0000-0000-0000-000000000007', '무관', 'Asia/Seoul');

select has_table('public', 'groups', 'groups table exists');
select has_table('public', 'group_memberships', 'group memberships table exists');
select has_table('public', 'group_invites', 'group invites table exists');
select has_function('public', 'create_group', array['text', 'uuid'], 'create_group rpc exists');
select has_function('public', 'accept_group_invite', array['text', 'uuid'], 'accept invite rpc exists');
select has_function('public', 'list_my_groups', array[]::text[], 'list_my_groups rpc exists');
select has_function('public', 'get_group_members', array['uuid', 'date'], 'get_group_members rpc exists');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$select * from public.create_group('오래된 친구들', '20000000-0000-0000-0000-000000000001')$$,
  'profiled user can create a group'
);

select is((select count(*) from public.groups), 1::bigint, 'admin sees created group');
select is((select count(*) from public.group_memberships), 1::bigint, 'admin sees admin membership');
select is((select role::text from public.group_memberships), 'admin', 'creator is admin');

create temporary table test_group_data as
select g.id as group_id
from public.groups g;

select lives_ok(
  format('select * from public.create_group_invite(%L)', (select group_id from test_group_data)),
  'admin can create invite'
);

create temporary table test_invite_data as
select code from public.create_group_invite((select group_id from test_group_data));

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);

select is((select count(*) from public.groups), 0::bigint, 'unjoined user cannot read group');
select is((select state from public.preview_group_invite((select code from test_invite_data))), 'valid', 'member previews valid invite');
select lives_ok(
  format(
    'select * from public.accept_group_invite(%L, %L)',
    (select code from test_invite_data),
    '20000000-0000-0000-0000-000000000002'
  ),
  'member accepts invite'
);
select is((select count(*) from public.groups), 1::bigint, 'joined member reads group');
select is((select count(*) from public.group_memberships), 2::bigint, 'joined member reads active membership list');
select throws_ok(
  format('select * from public.create_group_invite(%L)', (select group_id from test_group_data)),
  'P0001',
  'NOT_GROUP_ADMIN',
  'member cannot create invite'
);
select throws_ok(
  format(
    'select * from public.remove_group_member(%L, %L)',
    (select group_id from test_group_data),
    '10000000-0000-0000-0000-000000000001'
  ),
  'P0001',
  'NOT_GROUP_ADMIN',
  'member cannot remove another member'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select throws_ok(
  format('select * from public.accept_group_invite(%L, %L)', (select code from test_invite_data), '20000000-0000-0000-0000-000000000013'),
  'P0001',
  'GROUP_MEMBER_LIMIT_REACHED',
  'third active member is rejected for a 1:1 space'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select throws_ok(
  format('select * from public.leave_group(%L)', (select group_id from test_group_data)),
  'P0001',
  'ADMIN_CANNOT_LEAVE_WITH_MEMBERS',
  'admin cannot leave while another member is active'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000007', true);
select is((select count(*) from public.groups), 0::bigint, 'unrelated user cannot read group');
select is((select count(*) from public.group_memberships), 0::bigint, 'unrelated user cannot read memberships');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format('select * from public.leave_group(%L)', (select group_id from test_group_data)),
  'member can leave group'
);
select is((select count(*) from public.groups), 0::bigint, 'departed member immediately loses group read');
select is((select count(*) from public.group_memberships), 0::bigint, 'departed member immediately loses membership read');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select lives_ok(
  format('select * from public.create_group_invite(%L)', (select group_id from test_group_data)),
  'admin can issue replacement invite'
);

create temporary table replacement_invite as
select code from public.create_group_invite((select group_id from test_group_data));

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format(
    'select * from public.accept_group_invite(%L, %L)',
    (select code from replacement_invite),
    '20000000-0000-0000-0000-000000000003'
  ),
  'departed member can rejoin with a new membership row'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$select * from public.create_group('직장 절친', '20000000-0000-0000-0000-000000000021')$$,
  'user can create and belong to a second group'
);
select is((select count(*) from public.groups), 2::bigint, 'admin sees both active groups');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.groups), 1::bigint, 'member sees only groups with active membership');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select lives_ok(
  format(
    'select * from public.remove_group_member(%L, %L)',
    (select group_id from test_group_data),
    '10000000-0000-0000-0000-000000000002'
  ),
  'admin can remove active non-admin member'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.groups), 0::bigint, 'removed member loses group read');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select throws_ok(
  $$insert into public.groups (name, admin_user_id, created_by, client_request_id) values ('직접 생성', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004')$$,
  '42501',
  null,
  'authenticated direct group insert is denied'
);

select * from finish();
rollback;
