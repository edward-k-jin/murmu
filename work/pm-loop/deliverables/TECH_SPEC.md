# Murmu P0 1:1 Space Technical Specification

## Architecture Summary
- Client: React Native 0.85, Expo SDK 56 Development Build, Expo Router, TypeScript
- Server state: TanStack Query, 모든 1:1 공간 리소스 키에 현재 구현상 `groupId` 포함
- Backend: Supabase Auth, Postgres, RLS, Realtime, Edge Functions/Cron
- Authorization truth: 현재 활성 1:1 공간 멤버십과 역할

## Core Invariants
- 한 사용자는 여러 1:1 공간의 활성 멤버가 될 수 있다.
- 공간 생성자는 유일한 `admin`이며 P0 역할 이전은 없다.
- 각 공간은 활성 멤버 2명을 초과할 수 없다.
- 현재 활성 멤버는 가입 시점과 무관하게 해당 공간 기록을 읽는다.
- 멤버십 종료 즉시 모든 읽기, 쓰기, Realtime, 푸시 권한을 잃는다.
- 공개 기록은 작성자 탈퇴 후에도 보존된다.
- 미공개 예약 혼잣말은 작성자 멤버십 종료 트랜잭션에서 취소된다.

## Data Model

### `profiles`
- `user_id uuid primary key references auth.users`
- `nickname text not null`, `timezone text not null`, timestamps

### `groups`
- `id uuid primary key`
- `name text not null`
- `admin_user_id uuid not null references profiles`
- `plan text check in ('free','paid') default 'free'`
- `member_limit integer not null default 2`
- `status text check in ('active','closed')`
- timestamps

### `group_memberships`
- `id uuid primary key`
- `group_id uuid references groups`
- `user_id uuid references profiles`
- `role text check in ('admin','member')`
- `status text check in ('active','left','removed')`
- `joined_at timestamptz not null`, `ended_at timestamptz null`, `ended_by uuid null`
- partial unique `(group_id, user_id) where status = 'active'`
- partial unique admin index and active membership lookup indexes
- 재가입은 종료된 행을 되살리지 않고 새 membership 행을 만든다.

### `group_invites`
- `id`, `group_id`, `code_hash`, `created_by`, expiry/revocation timestamps
- only active admin may create or revoke

### `group_mood_checkins`
- `id`, `group_id`, `user_id`, `local_date`, `timezone`, `mood_code`, timestamps
- unique `(group_id, user_id, local_date)`

### `monologues`
- `id`, `group_id`, `author_id`, `client_request_id`
- `mood_code`, `body`
- `publish_mode check in ('immediate','scheduled')`
- `status check in ('scheduled','published','cancelled','deleted')`
- `scheduled_for`, `published_at`, `cancelled_at`, timestamps
- `cancel_reason check in ('author_cancelled','membership_ended')`
- unique `(author_id, client_request_id)`

### `monologue_thread_messages`
- `id`, `group_id`, `monologue_id`, `sender_id`, `client_request_id`, `body`, timestamps
- only published monologues accept messages

## Read Models
- Feed is available only to current active members.
- Published rows include body, author display, mood, timestamps, thread summary.
- Scheduled rows expose only id, author nickname, mood, scheduled time, locked status.
- Scheduled body is readable only by its active author.
- Cancelled scheduled rows are hidden from every non-author response.
- Published departed-author records remain readable to current active members.

## Transactional RPCs

### `create_group(name)`
Creates group and admin membership atomically.

### `create_group_invite(group_id)`
Requires active admin.

### `accept_group_invite(code)`
Locks invite and group, rechecks active count against `member_limit`, inserts membership atomically.

### `leave_group(group_id)`
- locks group and caller membership
- rejects admin when another active member exists
- ends membership
- cancels caller scheduled monologues with `membership_ended`

### `remove_group_member(group_id, target_user_id)`
- caller must be active admin
- target must be active non-admin
- ends membership and cancels target scheduled monologues in the same transaction

### `create_monologue(group_id, ...)`
Derives author from `auth.uid()` and requires active membership.

### `publish_due_monologues(batch_time)`
Publishes only rows whose author remains active; otherwise cancels before emitting events.

## RLS Model
- `private.is_active_group_member(group_id, user_id default auth.uid())`
- `private.is_group_admin(group_id, user_id default auth.uid())`
- revoke direct mutation grants and use RPCs
- space reads require current active membership
- feed reads do not require author membership to remain active
- scheduled body requires active author identity
- service-role push dispatch rechecks recipient membership
- push payload excludes monologue body, thread body, previews and body length
- scheduled monologues emit no recipient push before publication

## Realtime And Cache Revocation
- subscribe only to the selected `group_id` after membership verification
- membership changes invalidate authorization
- on `left/removed`, unsubscribe, clear group cache and drafts, remove navigation history, refresh group list
- server authorization remains authoritative

## Error Codes
- `GROUP_NOT_FOUND`, `NOT_GROUP_MEMBER`, `NOT_GROUP_ADMIN`
- `GROUP_MEMBER_LIMIT_REACHED`, `ALREADY_GROUP_MEMBER`
- `ADMIN_CANNOT_LEAVE_WITH_MEMBERS`, `CANNOT_REMOVE_ADMIN`
- `INVITE_INVALID`, `INVITE_EXPIRED`, `INVITE_REVOKED`
- `MONOLOGUE_NOT_PUBLISHABLE`, `VALIDATION_FAILED`, `CONFLICT`

## Migration Strategy
- 기존 couple 테이블을 직접 변형하지 않는다.
- 현재 출시 전 구현은 group-prefixed 테이블과 테스트를 1:1 공간 컨테이너로 제한한다.
- 현재 출시 전이라 사용자 데이터 migration은 필요하지 않다.
- 1:1 세로 슬라이스 검증 후 obsolete couple schema와 group-prefixed 명명 정리를 별도 승인된 migration으로 처리한다.

## Verification Gate
- empty DB migration and schema lint
- admin/member/unrelated-user RLS matrix
- 한 사용자의 다중 1:1 공간 간 데이터 비노출
- 동시 세 번째 멤버 가입 경쟁 테스트
- 멤버가 있는 관리자 탈퇴 거부
- 탈퇴/강퇴 즉시 모든 읽기/쓰기 차단
- 신규 멤버의 가입 전 공개 기록 열람
- 탈퇴자의 기존 기록 열람 차단
- 탈퇴 작성자의 공개 기록은 활성 멤버에게 유지
- 멤버십 종료와 예약 혼잣말 취소의 원자성
- Realtime/푸시 수신자 멤버십 재검사

## Implementation Sequence
1. 1:1 공간 정책과 실패하는 RLS/RPC 테스트
2. 공간 생성, 초대, 참여, 공간 목록
3. 탈퇴, 강퇴, 캐시 폐기 계약
4. 공간별 기분 체크인
5. 혼잣말 예약/공개 read model과 스레드
6. 푸시 이벤트
7. 교체 검증 후 기존 couple 구현 제거
