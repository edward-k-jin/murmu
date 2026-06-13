# Murmu P0 Technical Specification

## Architecture Summary
- Client: React Native 0.85, Expo SDK 56 Development Build, Expo Router, TypeScript
- Client data: TanStack Query for server state, component/local store only for ephemeral UI and drafts
- Backend: Supabase Auth, Postgres, Row Level Security, Realtime, Edge Functions, Cron
- Push: Expo Notifications token registration; server-triggered notification jobs
- Time: all instants stored as `timestamptz`; user timezone stored as IANA identifier

## System Boundaries

### Client Owns
- Navigation and presentation state
- Local compose drafts and optimistic message state
- Device notification permission and push token registration
- Accessibility labels derived only from authorized response data

### Database Owns
- Membership and authorization truth
- One-user-one-active-couple invariant
- Monologue visibility and request state
- Conversation date labels and write eligibility
- Idempotency and audit timestamps

### Edge Functions Own
- OAuth/deep-link completion helpers when required
- Atomic invite acceptance
- Push dispatch and privacy-safe payload construction
- Scheduled monologue publication
- Server-side validation that cannot be expressed cleanly in RLS/check constraints

## Core Data Model

### `profiles`
- `user_id uuid primary key references auth.users`
- `nickname text not null`
- `birth_date date null`
- `timezone text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `couples`
- `id uuid primary key`
- `status text check in ('active','disconnected')`
- `created_at timestamptz not null`
- `disconnected_at timestamptz null`

### `couple_members`
- `couple_id uuid references couples`
- `user_id uuid references profiles`
- `joined_at timestamptz not null`
- `left_at timestamptz null`
- primary key `(couple_id, user_id)`
- partial unique index on `user_id where left_at is null`
- constraint/trigger limits active members per couple to two

### `couple_invites`
- `id uuid primary key`
- `code_hash text unique not null`
- `couple_id uuid not null`
- `inviter_id uuid not null`
- `expires_at timestamptz not null`
- `accepted_by uuid null`
- `accepted_at timestamptz null`
- `revoked_at timestamptz null`
- raw invite code is returned once and never stored directly

### `mood_checkins`
- `id uuid primary key`
- `couple_id uuid null`
- `user_id uuid not null`
- `local_date date not null`
- `timezone text not null`
- `mood_code text not null`
- `note text null` reserved, not exposed in P0
- `created_at`, `updated_at timestamptz`
- unique `(user_id, local_date)`

### `conversation_days`
- `id uuid primary key`
- `couple_id uuid not null`
- `label_date date not null`
- `label_timezone text not null`
- `started_at timestamptz not null`
- `last_message_at timestamptz null`
- unique `(couple_id, label_date)`
- append permission depends on server-derived current local date matching `label_date`

### `conversation_messages`
- `id uuid primary key`
- `client_request_id uuid not null`
- `conversation_day_id uuid not null`
- `sender_id uuid not null`
- `body text not null check length 1..5000`
- `mood_code text null`
- `created_at timestamptz not null`
- unique `(sender_id, client_request_id)`

### `monologues`
- `id uuid primary key`
- `author_id uuid not null`
- `couple_id uuid null`
- `mood_code text not null`
- `body text not null check length 1..10000`
- `visibility_mode text check in ('on_request','scheduled')`
- `visibility_status text check in ('private','request_pending','scheduled','opened','deleted')`
- `scheduled_for timestamptz null`
- `opened_at timestamptz null`
- `created_at`, `updated_at`, `deleted_at timestamptz`
- pre-pair monologues keep `couple_id null` until explicit author share action

### `monologue_access_requests`
- `id uuid primary key`
- `monologue_id uuid not null`
- `requester_id uuid not null`
- `status text check in ('pending','approved','deferred','cancelled')`
- `requested_at`, `resolved_at timestamptz`
- at most one pending request per monologue/requester
- every defer is a new resolution event only if future policy needs counts; P0 keeps latest request row plus audit log

### `monologue_thread_messages`
- `id uuid primary key`
- `client_request_id uuid not null`
- `monologue_id uuid not null`
- `sender_id uuid not null`
- `body text not null check length 1..5000`
- `created_at timestamptz not null`
- only writable while monologue is `opened`

### `push_devices`
- `id uuid primary key`
- `user_id uuid not null`
- `expo_push_token text unique not null`
- `platform text check in ('ios','android')`
- `enabled boolean not null default true`
- `last_seen_at timestamptz not null`

### `domain_events`
- `id uuid primary key`
- `event_type text not null`
- `aggregate_id uuid not null`
- `recipient_id uuid null`
- `payload jsonb not null`
- `created_at timestamptz not null`
- `processed_at timestamptz null`
- outbox pattern for reliable push jobs

## Privacy-Safe Read Models

### Author Monologue View
Returns full body and all author-controlled state for `auth.uid() = author_id`.

### Partner Monologue List View
Returns only:
- monologue id
- author nickname
- mood code
- created timestamp
- visibility status
- scheduled/opened timestamp when applicable

It must not select body, body length, preview, updated timestamp that can leak editing activity, or thread content before opened.

### Opened Monologue Detail Function
A security-invoker RPC returns body only when requester is author or active partner and status is `opened`.

## Authorization Invariants
- All tables enable RLS with no broad authenticated fallback policy.
- A user reads/writes only their profile except partner-safe nickname lookup.
- Couple data requires active membership.
- Invite acceptance runs in one transaction with row locks and rechecks both users are unpaired.
- Only author creates, updates, deletes, schedules, approves, or defers a monologue.
- Partner may request access only for active-couple `on_request` monologues.
- Thread messages require active couple membership and opened monologue status.
- Client-provided `author_id`, `sender_id`, and membership identifiers are ignored or checked against `auth.uid()`.
- Service role key exists only in server environment and never in Expo public config.

## Conversation Session Semantics
PRD의 `앱 종료 또는 1시간 비활성 마감`은 UI 활동 세션 규칙으로 구현한다. 기록 저장 단위는 날짜별 `conversation_days` 하나다.

- `started_at`: 해당 날짜 첫 메시지 또는 시작 버튼 시각
- `last_message_at`: 마지막 서버 승인 메시지 시각
- client active session expires after app background/termination signal or 1 hour inactivity
- same `label_date` reopening uses the same `conversation_day_id`
- server rejects writes when current user-local date is later than `label_date`
- midnight does not split an already open UI view, but messages sent after local date rollover require a new date record

### PM Clarification
PRD의 `자정을 넘겨도 시작일로 기록`과 `어제 이전 추가 작성 불가`는 동시에 엄밀히 만족할 수 없다. P0 권장안은 서버가 메시지 전송 시점의 사용자 날짜를 기준으로 자정 이후 새 날짜 기록을 사용하고, 화면은 전환 안내를 표시하는 것이다.

## Timezone Rules
- profile timezone is updated when app observes a confirmed device timezone change
- date labels use sender/couple canonical timezone, initially inviter timezone
- scheduled release stores exact UTC instant calculated at creation
- later timezone changes do not move an existing `scheduled_for`
- `3일 후` means creation instant plus 72 hours for P0

## API And RPC Contract
- `create_invite() -> { code, deep_link, expires_at }`
- `preview_invite(code) -> { inviter_nickname, expires_at, valid_state }`
- `accept_invite(code) -> { couple_id, partner_profile }`
- `upsert_mood_checkin(local_date, timezone, mood_code)`
- `start_or_get_conversation_day(local_date, timezone)`
- `send_conversation_message(day_id, client_request_id, body, mood_code?)`
- `create_monologue(mood_code, body, visibility_mode, scheduled_for?)`
- `request_monologue_access(monologue_id)`
- `resolve_monologue_request(request_id, action)` where action is approve/defer
- `cancel_monologue_request(request_id)`
- `get_opened_monologue(monologue_id)`
- `send_monologue_thread_message(monologue_id, client_request_id, body)`
- `register_push_device(token, platform)`

All mutating RPCs return domain result plus stable machine-readable error code.

## Realtime Channels
- couple conversation messages filtered by `conversation_day_id`
- partner-safe mood checkin changes filtered by active couple
- partner-safe monologue list changes
- access request changes visible to author/requester only
- opened monologue thread messages
- Realtime is an update hint, not authorization; every payload still depends on RLS-safe tables/views

## Push Event Policy
- Payload contains event type and opaque target id only.
- Notification text never contains monologue body or message body by default.
- Server verifies recipient is still active couple member before dispatch.
- Invalid/expired tokens are disabled after provider response.

## Offline And Idempotency
- messages and monologues use client-generated request IDs
- retryable writes are idempotent by `(sender/author, client_request_id)`
- invite acceptance, access resolution, and scheduled release require online transactional execution
- cached partner-safe lists never persist unauthorized body fields because those fields are never returned

## Dependency Map
1. Auth and profile schema
2. Couple membership and atomic invite RPC
3. Mood checkins
4. Conversation day/message schema and RLS
5. Monologue author table plus partner-safe read model
6. Access request and scheduled release jobs
7. Opened thread messages
8. Push outbox and device registration
9. Client feature slices in the same order

## Testing Strategy
- pgTAP or SQL integration tests for every RLS policy and RPC invariant
- two-user fixtures plus unrelated third-user negative tests
- timezone tests around midnight, DST, and timezone change
- duplicate retry tests for message and monologue creation
- scheduled publication test with clock-controlled job input
- React Native unit tests for state mapping; device tests for deep link and push routing

## Risks And Mitigations
- RLS view bypass: use security-invoker views/RPCs and test with authenticated roles
- Realtime leaks: subscribe only to RLS-protected relations; no service-role broadcast of bodies
- Couple race condition: atomic acceptance with locks and partial unique index
- Scheduled job delay: status is corrected on read/RPC if `scheduled_for <= now()` in addition to cron
- App termination detection: treat as client activity state, never database truth
- Policy questions: disconnected-couple data remains inaccessible until deletion/export policy is approved

## Implementation Sequence
1. Backend Engineer writes schema migrations and failing RLS tests.
2. UI Designer converts UX states into screen/component specification.
3. Frontend Engineer builds auth/profile/pairing vertical slice against typed RPC wrappers.
4. Repeat vertical slices for mood/chat, monologue, push.
5. Security Reviewer validates RLS and notification privacy before release.

