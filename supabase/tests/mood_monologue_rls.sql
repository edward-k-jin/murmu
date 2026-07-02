begin;

create extension if not exists pgtap with schema extensions;

select plan(40);

insert into auth.users (id, email, is_sso_user, is_anonymous)
values
  ('30000000-0000-0000-0000-000000000001', 'mood-admin@murmu.local', false, false),
  ('30000000-0000-0000-0000-000000000002', 'mood-member@murmu.local', false, false),
  ('30000000-0000-0000-0000-000000000003', 'mood-new@murmu.local', false, false),
  ('30000000-0000-0000-0000-000000000004', 'mood-unrelated@murmu.local', false, false);

insert into public.profiles (user_id, nickname, timezone)
values
  ('30000000-0000-0000-0000-000000000001', '기록장', 'Asia/Seoul'),
  ('30000000-0000-0000-0000-000000000002', '친구', 'Asia/Seoul'),
  ('30000000-0000-0000-0000-000000000003', '새친구', 'Asia/Seoul'),
  ('30000000-0000-0000-0000-000000000004', '무관한사람', 'Asia/Seoul');

select has_table('public', 'group_mood_checkins', 'mood checkins table exists');
select has_table('public', 'monologues', 'monologues table exists');
select has_table('public', 'monologue_thread_messages', 'thread messages table exists');
select has_function('public', 'upsert_group_mood', array['uuid', 'date', 'text', 'text'], 'mood rpc exists');
select has_function('public', 'create_monologue', array['uuid', 'uuid', 'text', 'text', 'monologue_publish_mode', 'timestamp with time zone'], 'create monologue rpc exists');
select has_function('public', 'list_group_feed', array['uuid', 'integer', 'timestamp with time zone', 'uuid'], 'feed rpc exists');
select has_function('public', 'get_scheduled_monologue', array['uuid'], 'scheduled author rpc exists');
select has_function('public', 'get_published_monologue', array['uuid', 'uuid'], 'published detail rpc exists');
select has_function('public', 'send_thread_message', array['uuid', 'uuid', 'uuid', 'text'], 'thread send rpc exists');
select has_function('public', 'list_thread_messages', array['uuid', 'uuid', 'integer', 'timestamp with time zone', 'uuid'], 'thread list rpc exists');
select has_function('public', 'publish_due_monologues', array['timestamp with time zone'], 'due publisher rpc exists');

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);

create temporary table mood_group as
select group_id
from public.create_group('기록하는 친구들', '31000000-0000-0000-0000-000000000001');

create temporary table other_group as
select group_id
from public.create_group('다른 그룹', '31000000-0000-0000-0000-000000000002');

create temporary table mood_invite as
select code from public.create_group_invite((select group_id from mood_group));

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format(
    'select * from public.accept_group_invite(%L, %L)',
    (select code from mood_invite),
    '31000000-0000-0000-0000-000000000003'
  ),
  'member joins the group'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select lives_ok(
  format(
    'select * from public.upsert_group_mood(%L, %L, %L, %L)',
    (select group_id from mood_group),
    current_date,
    'Asia/Seoul',
    'calm'
  ),
  'admin checks in a group mood'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format(
    'select * from public.upsert_group_mood(%L, %L, %L, %L)',
    (select group_id from mood_group),
    current_date,
    'Asia/Seoul',
    'happy'
  ),
  'member checks in a group mood'
);
select is(
  (select count(*) from public.get_group_members((select group_id from mood_group), current_date) where today_mood is not null),
  2::bigint,
  'active members can read group mood checkins'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
create temporary table published_monologue as
select monologue_id
from public.create_monologue(
  (select group_id from mood_group),
  '32000000-0000-0000-0000-000000000001',
  'calm',
  '오늘은 조금 천천히 가고 싶다.',
  'immediate',
  null
);

select is(
  (select monologue_status from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from published_monologue)),
  'published',
  'immediate monologue is published'
);
select is(
  (select body from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from published_monologue)),
  '오늘은 조금 천천히 가고 싶다.',
  'published feed item includes body'
);

create temporary table scheduled_monologue as
select monologue_id
from public.create_monologue(
  (select group_id from mood_group),
  '32000000-0000-0000-0000-000000000002',
  'tired',
  '예약 본문은 다른 멤버에게 보이면 안 된다.',
  'scheduled',
  now() + interval '2 hours'
);

select is(
  (select monologue_status from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from scheduled_monologue)),
  'scheduled',
  'scheduled monologue appears as locked metadata'
);
select is(
  (select body from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from scheduled_monologue)),
  null,
  'scheduled feed item never includes body'
);
select is(
  (select body from public.get_scheduled_monologue((select monologue_id from scheduled_monologue))),
  '예약 본문은 다른 멤버에게 보이면 안 된다.',
  'active author can read own scheduled body'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select throws_ok(
  format('select * from public.get_scheduled_monologue(%L)', (select monologue_id from scheduled_monologue)),
  'P0001',
  'MONOLOGUE_NOT_EDITABLE',
  'another member cannot read scheduled body'
);
select is(
  (select body from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from scheduled_monologue)),
  null,
  'scheduled body remains hidden from member feed'
);

create temporary table member_message as
select message_id
from public.send_thread_message(
  (select group_id from mood_group),
  (select monologue_id from published_monologue),
  '33000000-0000-0000-0000-000000000001',
  '옆에서 같이 천천히 갈게.'
);

select is(
  (select count(*) from public.list_thread_messages((select group_id from mood_group), (select monologue_id from published_monologue))),
  1::bigint,
  'active member can read published monologue thread'
);
select is(
  (select body from public.list_thread_messages((select group_id from mood_group), (select monologue_id from published_monologue))),
  '옆에서 같이 천천히 갈게.',
  'thread message body is returned to active members'
);

select throws_ok(
  format(
    'select * from public.get_published_monologue(%L, %L)',
    (select group_id from other_group),
    (select monologue_id from published_monologue)
  ),
  'P0001',
  'NOT_GROUP_MEMBER',
  'cross-group detail substitution is denied'
);

select throws_ok(
  $$select * from public.monologues$$,
  '42501',
  null,
  'authenticated direct monologue read is denied'
);
select throws_ok(
  format(
    'insert into public.monologues (group_id, author_id, client_request_id, mood_code, body, publish_mode, status, published_at) values (%L, %L, %L, %L, %L, %L, %L, now())',
    (select group_id from mood_group),
    '30000000-0000-0000-0000-000000000002',
    '32000000-0000-0000-0000-000000000099',
    'calm',
    'direct write',
    'immediate',
    'published'
  ),
  '42501',
  null,
  'authenticated direct monologue mutation is denied'
);

create temporary table leaving_scheduled as
select monologue_id
from public.create_monologue(
  (select group_id from mood_group),
  '32000000-0000-0000-0000-000000000003',
  'sad',
  '탈퇴하면 이 예약은 취소된다.',
  'scheduled',
  now() + interval '3 hours'
);

create temporary table leave_result as
select * from public.leave_group((select group_id from mood_group));

select is(
  (select cancelled_scheduled_count from leave_result),
  1,
  'leaving atomically cancels own scheduled monologues'
);
select throws_ok(
  format('select * from public.list_group_feed(%L)', (select group_id from mood_group)),
  'P0001',
  'NOT_GROUP_MEMBER',
  'departed member immediately loses feed access'
);
select throws_ok(
  format(
    'select * from public.list_thread_messages(%L, %L)',
    (select group_id from mood_group),
    (select monologue_id from published_monologue)
  ),
  'P0001',
  'NOT_GROUP_MEMBER',
  'departed member immediately loses thread access'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select is(
  (select count(*) from public.list_thread_messages((select group_id from mood_group), (select monologue_id from published_monologue))),
  1::bigint,
  'departed sender thread message remains visible to active members'
);
select is(
  (select sender_is_active from public.list_thread_messages((select group_id from mood_group), (select monologue_id from published_monologue))),
  false,
  'departed thread sender is marked inactive'
);
select is(
  (select count(*) from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from published_monologue)),
  1::bigint,
  'published records remain after another member leaves'
);

create temporary table due_monologue as
select monologue_id
from public.create_monologue(
  (select group_id from mood_group),
  '32000000-0000-0000-0000-000000000004',
  'hopeful',
  '공개 시간이 지나면 볼 수 있는 본문.',
  'scheduled',
  now() + interval '1 minute'
);

set local role service_role;
create temporary table publish_result as
select * from public.publish_due_monologues(now() + interval '2 minutes');
select is((select published_count from publish_result), 1, 'due active-author monologue is published');

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select is(
  (select body from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from due_monologue)),
  '공개 시간이 지나면 볼 수 있는 본문.',
  'published due item now includes body'
);

create temporary table new_invite as
select code from public.create_group_invite((select group_id from mood_group));

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select lives_ok(
  format(
    'select * from public.accept_group_invite(%L, %L)',
    (select code from new_invite),
    '31000000-0000-0000-0000-000000000004'
  ),
  'new member joins after records were created'
);
select is(
  (select count(*) from public.list_group_feed((select group_id from mood_group)) where monologue_status = 'published'),
  2::bigint,
  'new member can read pre-join published records'
);
select is(
  (select body from public.list_group_feed((select group_id from mood_group)) where monologue_id = (select monologue_id from published_monologue)),
  '오늘은 조금 천천히 가고 싶다.',
  'pre-join published body is visible to new member'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000004', true);
select throws_ok(
  format('select * from public.upsert_group_mood(%L, current_date, %L, %L)', (select group_id from mood_group), 'Asia/Seoul', 'calm'),
  'P0001',
  'NOT_GROUP_MEMBER',
  'unrelated user cannot check in mood'
);
select throws_ok(
  format('select * from public.list_group_feed(%L)', (select group_id from mood_group)),
  'P0001',
  'NOT_GROUP_MEMBER',
  'unrelated user cannot read feed'
);

select * from finish();
rollback;
