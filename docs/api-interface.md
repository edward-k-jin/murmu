# Murmu P0 1:1 Space API Interface

## Contract Rules
- 사용자 ID는 항상 `auth.uid()`에서 결정한다.
- 모든 1:1 공간 mutation은 현재 활성 멤버십과 역할을 서버에서 재검증한다.
- 직접 테이블 mutation 권한은 제거하고 RPC를 사용한다.
- 시간은 ISO 8601 UTC, 시간대는 IANA 문자열이다.
- 목록은 `(created_at, id)` cursor pagination을 사용한다.

## Standard Error
```ts
type DomainErrorCode =
  | 'UNAUTHENTICATED'
  | 'PROFILE_REQUIRED'
  | 'GROUP_NOT_FOUND'
  | 'NOT_GROUP_MEMBER'
  | 'NOT_GROUP_ADMIN'
  | 'GROUP_MEMBER_LIMIT_REACHED'
  | 'ALREADY_GROUP_MEMBER'
  | 'ADMIN_CANNOT_LEAVE_WITH_MEMBERS'
  | 'CANNOT_REMOVE_ADMIN'
  | 'INVITE_INVALID'
  | 'INVITE_EXPIRED'
  | 'INVITE_REVOKED'
  | 'MONOLOGUE_NOT_EDITABLE'
  | 'MONOLOGUE_NOT_PUBLISHED'
  | 'VALIDATION_FAILED'
  | 'CONFLICT';
```

## Profile

### `upsert_profile`
Input: `{ nickname: string; timezone: string }`

Output: `{ userId: string; nickname: string; timezone: string }`

Validation: nickname trimmed 1..20, allowed IANA timezone.

## 1:1 Spaces

### `create_group`
Input: `{ name: string; clientRequestId: string }`

Output: `{ id: string; name: string; role: 'admin'; activeMemberCount: 1; memberLimit: 2 }`

The backend still exposes `group_*` RPC names for now, but the product policy is a 1:1 relationship space. Space creation and owner membership are atomic and idempotent by caller/request ID.

### `list_my_groups`
Returns active memberships only:
```ts
type MyGroupSummary = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  activeMemberCount: number;
  memberLimit: number;
  unread: boolean;
};
```

### `get_group_members`
Input: `{ groupId: string }`

Returns active members with `{ userId, nickname, role, joinedAt, todayMood }`.

## Invitations

### `create_group_invite`
Input: `{ groupId: string }`

Output: `{ code: string; deepLink: string; expiresAt: string }`

Only active admin. Issuing a new code may revoke the previous active invite.

### `preview_group_invite`
Input: `{ code: string }`

Output:
```ts
{
  state: 'valid' | 'invalid' | 'expired' | 'revoked' | 'full' | 'already_joined';
  group?: { name: string; adminNickname: string; activeMemberCount: number; memberLimit: number };
  expiresAt?: string;
}
```

No record or member list beyond this preview is returned.

### `accept_group_invite`
Input: `{ code: string; clientRequestId: string }`

Output: `MyGroupSummary`

Locks invite/space, rechecks expiry, revocation and count, then creates a new membership row. Concurrent joins cannot exceed `member_limit = 2`.

## Membership Lifecycle

### `leave_group`
Input: `{ groupId: string }`

Output: `{ groupId: string; status: 'left'; cancelledScheduledCount: number }`

- admin with another active member is rejected
- membership end and scheduled cancellation are atomic
- caller loses access immediately after commit

### `remove_group_member`
Input: `{ groupId: string; targetUserId: string }`

Output: `{ groupId: string; targetUserId: string; status: 'removed'; cancelledScheduledCount: number }`

Only active admin; cannot target admin.

## Mood

### `upsert_group_mood`
Input: `{ groupId: string; localDate: string; timezone: string; moodCode: string }`

Output: `{ id: string; groupId: string; localDate: string; moodCode: string; updatedAt: string }`

## Monologues

### `create_monologue`
Input:
```ts
{
  groupId: string;
  clientRequestId: string;
  moodCode: string;
  body: string;
  publishMode: 'immediate' | 'scheduled';
  scheduledFor?: string;
}
```

Requires active membership; body 1..10000; scheduled time after server now.

### `update_scheduled_monologue`
Input: `{ monologueId: string; moodCode: string; body: string; scheduledFor: string }`

Only active author while status is `scheduled`.

### `cancel_scheduled_monologue`
Input: `{ monologueId: string }`

Output: `{ status: 'cancelled' }`

### `list_group_feed`
Input: `{ groupId: string; beforeCreatedAt?: string; beforeId?: string; limit?: number }`

Published items include body. Scheduled items include only id, author nickname, mood, createdAt, scheduledFor and locked status. Cancelled rows are omitted.

### `get_scheduled_monologue`
Input: `{ monologueId: string }`

Only the active author can read the body of a scheduled monologue. Feed responses never reuse this author-only shape.

### `get_published_monologue`
Input: `{ groupId: string; monologueId: string }`

Requires active membership and published status.

## Thread

### `send_thread_message`
Input: `{ groupId: string; monologueId: string; clientRequestId: string; body: string }`

Requires active membership and published monologue; body 1..5000.

### `list_thread_messages`
Input: `{ groupId: string; monologueId: string; afterCreatedAt?: string; afterId?: string; limit?: number }`

Published messages remain visible when sender later leaves.

## Push And Realtime
- Events: `monologue.published`, `thread_message.created`, `mood.checked_in`, `membership.removed`
- Payload contains `groupId`, `eventType` and opaque target ID only.
- Authored body, body preview, body length and thread message text are never included.
- Scheduled monologues do not emit recipient push events before publication.
- Safe display copy examples: `새로 공개된 혼잣말이 있어요.`, `새 답장이 도착했어요.`
- Recipient membership is rechecked at dispatch time.
- `membership.removed` triggers local cache revocation for the affected user.

### Notification Preferences
Client-facing settings:
```ts
type NotificationPreferences = {
  enabled: boolean;
  monologuePublished: boolean;
  scheduledPublished: boolean;
  threadReply: boolean;
  spaceEvents: boolean;
  moodReminder: boolean;
};
```

Preferences never override security events that revoke local access. The server still rechecks active membership before dispatching every push event.

## RLS Matrix
| Resource | Active Admin | Active Member | Departed/Unrelated |
|---|---|---|---|
| Group summary/member list | read | read | none |
| Invite create/revoke | yes | no | no |
| Member remove | yes | no | no |
| Group leave | blocked with members | yes | no |
| Published feed/history | read | read | none |
| Scheduled metadata | read | read | none |
| Scheduled body | own only | own only | none |
| Published departed-author content | read | read | none |

## Index Requirements
- all foreign keys indexed
- active membership `(group_id, user_id) where status='active'`
- user group list `(user_id, status, joined_at desc)`
- one active admin `(group_id) where role='admin' and status='active'`
- active invite `(group_id, expires_at) where revoked_at is null`
- feed `(group_id, created_at desc, id desc) where status in ('scheduled','published')`
- due publication `(scheduled_for, id) where status='scheduled'`
- thread `(monologue_id, created_at, id)`

## Backend Verification Gate
- empty DB migration and schema lint
- admin/member/unrelated RLS tests
- cross-group ID substitution tests
- concurrent sixth free-member acceptance test
- admin leave rejection and member removal authorization
- departed member immediately loses historical reads
- new member reads pre-join published records
- membership end atomically cancels scheduled content
- scheduled feed response contains no body/length/preview keys
- authenticated direct table mutations are denied
