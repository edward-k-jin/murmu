# Murmu P0 API Interface

## Contract Rules
- 인증된 호출은 Supabase access token을 사용한다.
- 사용자 식별자는 요청 본문을 신뢰하지 않고 `(select auth.uid())`로 결정한다.
- 모든 mutation은 `{ data, error }` 형태로 매핑 가능한 단일 결과를 반환한다.
- 오류는 사용자 문구가 아닌 안정적인 `code`를 반환한다.
- 시간 값은 ISO 8601 UTC, 날짜 라벨은 `YYYY-MM-DD`, 시간대는 IANA 문자열이다.
- 목록은 cursor pagination을 사용한다.

## Standard Error
```ts
type DomainErrorCode =
  | 'UNAUTHENTICATED'
  | 'PROFILE_REQUIRED'
  | 'ALREADY_PAIRED'
  | 'INVITE_INVALID'
  | 'INVITE_EXPIRED'
  | 'INVITE_USED'
  | 'INVITE_SELF'
  | 'NOT_COUPLE_MEMBER'
  | 'PAST_CONVERSATION_READ_ONLY'
  | 'MONOLOGUE_NOT_REQUESTABLE'
  | 'REQUEST_ALREADY_PENDING'
  | 'MONOLOGUE_NOT_OPENED'
  | 'VALIDATION_FAILED'
  | 'CONFLICT';

type DomainError = {
  code: DomainErrorCode;
  field?: string;
};
```

## Profile

### `upsert_profile`
Input:
```ts
{ nickname: string; birthDate?: string; timezone: string }
```
Output:
```ts
{ userId: string; nickname: string; birthDate: string | null; timezone: string }
```

Validation:
- nickname trimmed length 1..20
- timezone must resolve to an allowed IANA timezone

## Pairing

### `create_invite`
Input: none

Output:
```ts
{ code: string; deepLink: string; expiresAt: string }
```

Rules:
- caller must be unpaired or the sole active member of a pending couple
- previous active invite is revoked
- raw code is returned once; database stores hash
- default expiry: 24 hours

### `preview_invite`
Input: `{ code: string }`

Output:
```ts
{
  state: 'valid' | 'invalid' | 'expired' | 'used' | 'self' | 'already_paired';
  inviter?: { nickname: string };
  expiresAt?: string;
}
```

### `accept_invite`
Input: `{ code: string }`

Output:
```ts
{ coupleId: string; partner: { userId: string; nickname: string } }
```

Transaction:
1. lock invite row
2. lock both member identities in deterministic UUID order
3. recheck invite and pairing state
4. insert member and mark invite used
5. commit before push/event work

## Mood

### `upsert_mood_checkin`
Input:
```ts
{ localDate: string; timezone: string; moodCode: string }
```

Output:
```ts
{ id: string; localDate: string; moodCode: string; updatedAt: string }
```

### `get_today_moods`
Output:
```ts
{
  me: MoodCheckin | null;
  partner: MoodCheckin | null;
}
```

Partner response excludes private note fields.

## Conversation

### `start_or_get_conversation_day`
Input: `{ localDate: string; timezone: string }`

Output:
```ts
{ id: string; labelDate: string; startedAt: string; writable: boolean }
```

Server verifies local date against the couple canonical timezone. The client value is not authoritative.

### `send_conversation_message`
Input:
```ts
{
  conversationDayId: string;
  clientRequestId: string;
  body: string;
  moodCode?: string;
}
```

Output:
```ts
{
  id: string;
  senderId: string;
  body: string;
  moodCode: string | null;
  createdAt: string;
}
```

Rules:
- body trimmed length 1..5000
- request is idempotent by caller + clientRequestId
- past date returns `PAST_CONVERSATION_READ_ONLY`

### Conversation list query
Cursor: `(created_at, id)` descending for history; messages ascending within a day.

## Monologues

### `create_monologue`
Input:
```ts
{
  clientRequestId: string;
  moodCode: string;
  body: string;
  visibilityMode: 'on_request' | 'scheduled';
  scheduledFor?: string;
}
```

Output: AuthorMonologue

Rules:
- body trimmed length 1..10000
- scheduled mode requires exactly creation time + 72 hours in P0
- unpaired caller creates author-only record with no couple assignment

### `list_my_monologues`
Returns full author records with cursor pagination.

### `list_partner_monologues`
Returns only:
```ts
type PartnerMonologueListItem = {
  id: string;
  authorNickname: string;
  moodCode: string;
  createdAt: string;
  status: 'private' | 'request_pending' | 'scheduled' | 'opened' | 'deleted';
  scheduledFor: string | null;
  openedAt: string | null;
};
```

The SQL read model must not include body or derived body metadata.

### `request_monologue_access`
Input: `{ monologueId: string }`

Output:
```ts
{ requestId: string; status: 'pending'; requestedAt: string }
```

### `cancel_monologue_request`
Input: `{ requestId: string }`

Output: `{ status: 'cancelled' }`

### `resolve_monologue_request`
Input:
```ts
{ requestId: string; action: 'approve' | 'defer' }
```

Output:
```ts
{ status: 'approved' | 'deferred'; monologueStatus: 'opened' | 'private' }
```

Only the author can resolve. Approval atomically opens the monologue.

### `get_opened_monologue`
Input: `{ monologueId: string }`

Output:
```ts
{
  id: string;
  authorId: string;
  authorNickname: string;
  moodCode: string;
  body: string;
  createdAt: string;
  openedAt: string;
}
```

## Monologue Thread

### `send_monologue_thread_message`
Input:
```ts
{ monologueId: string; clientRequestId: string; body: string }
```

Output: ThreadMessage

Rules:
- monologue must be opened
- caller must be active couple member
- body length 1..5000

## Push Devices

### `register_push_device`
Input:
```ts
{ expoPushToken: string; platform: 'ios' | 'android' }
```

Output: `{ registered: true }`

Notification data payload:
```ts
{
  eventType:
    | 'message.created'
    | 'mood.checked_in'
    | 'monologue.created'
    | 'monologue.access_requested'
    | 'monologue.opened';
  targetId: string;
}
```

No user-authored body is included in notification title, body, or data payload.

## RLS Policy Matrix
| Resource | Author/User | Active Partner | Unrelated User |
|---|---|---|---|
| Profile full | read/write own | nickname only | none |
| Couple membership | read own couple | read same couple | none |
| Mood | full own | partner-safe fields | none |
| Conversation | read/write current date | read/write current date | none |
| Past conversation | read | read | none |
| Monologue author view | full | none | none |
| Partner monologue list | n/a | metadata only | none |
| Opened monologue detail | full | full after opened | none |
| Access request | author resolve | requester create/cancel/read | none |
| Thread | read/write if opened | read/write if opened | none |

## Index Requirements
- every foreign key column indexed
- partial unique active membership index on `couple_members(user_id) where left_at is null`
- partial pending invite index on `(inviter_id, expires_at) where accepted_at is null and revoked_at is null`
- conversation day unique `(couple_id, label_date)`
- message pagination `(conversation_day_id, created_at, id)`
- partner list `(couple_id, created_at desc, id desc) where deleted_at is null`
- pending request unique `(monologue_id, requester_id) where status = 'pending'`
- RLS membership lookups indexed by `(couple_id, user_id)`

## Backend Verification Gate
- SQL formatting/lint
- migration applies from empty database
- RLS positive tests for both couple members
- RLS negative tests for unrelated third user
- concurrent invite acceptance test
- duplicate request ID test
- partner list response snapshot proving body keys are absent
- midnight and timezone contract tests

