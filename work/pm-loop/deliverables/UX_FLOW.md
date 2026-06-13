# Murmu P0 UX Flow

## UX Goal
사용자가 감정을 적는 순간에는 안전하다고 느끼고, 상대의 감정을 보는 순간에는 경계를 존중하도록 만든다. 채팅은 빠르게, 혼잣말은 의도적으로 느리게 설계한다.

## Navigation Model

### Signed Out
- Welcome
- Social Login
- Profile Setup

### Signed In, Unpaired
- Pairing Hub
- Invite Share
- Join With Code
- Solo Monologue Preview

### Signed In, Paired
- Bottom tabs: 대화 / 혼잣말 / 함께 / 마이
- P0에서 `함께`는 준비 중 화면과 최근 감정 기록 안내만 제공한다.
- 앱 진입 기본 탭은 `대화`다.

## Primary Journey 1: Sign In And Pair
1. Welcome에서 앱 가치와 혼잣말 공개 통제 원칙을 확인한다.
2. Apple 또는 Google로 로그인한다.
3. 닉네임을 입력한다. 생년월일은 P1 기념일 기능 전까지 선택 입력으로 둔다.
4. Pairing Hub에서 `초대하기` 또는 `초대코드 입력`을 선택한다.
5. 초대자는 코드와 딥링크를 생성해 시스템 공유 시트로 보낸다.
6. 초대받은 사용자는 링크 또는 코드로 상대를 확인하고 연결을 확정한다.
7. 양쪽 모두 연결 성공 화면을 본 뒤 대화 탭으로 이동한다.

### Pairing Guardrails
- 이미 연결된 사용자는 새 초대 생성 또는 다른 초대 수락을 할 수 없다.
- 자기 초대코드는 수락할 수 없다.
- 만료, 사용 완료, 존재하지 않는 코드는 서로 다른 오류로 설명한다.
- 초대 수락 직전에 상대 닉네임을 보여주고 한 번 더 확인한다.
- 연결 전 사용자는 앱을 둘러보고 자신의 혼잣말을 작성할 수 있다.

## Primary Journey 2: Daily Mood And Conversation
1. 대화 탭 상단에서 오늘 내 기분을 선택하거나 변경한다.
2. 상대가 체크인했다면 기분과 체크인 시각만 보여준다.
3. 오늘 대화가 없으면 `오늘의 대화 시작하기`를 표시한다.
4. 시작하면 오늘 날짜 라벨의 세션을 열고 텍스트를 보낸다.
5. 메시지는 선택적으로 기분 태그 하나를 가진다.
6. 앱 종료 또는 1시간 비활성 시 활성 입력 세션은 닫히지만, 같은 날짜에 다시 열면 같은 날짜 기록에 이어 쓴다.
7. 어제 이전 기록을 열면 입력창 대신 `지난 대화는 읽기만 할 수 있어` 상태를 표시한다.

### Conversation To Monologue
- 메시지 작성 영역의 보조 행동으로 `혼잣말로 남기기`를 제공한다.
- 선택하면 작성 중 텍스트를 혼잣말 작성 화면으로 옮기되 자동 저장하지 않는다.
- 전환 취소 시 원래 메시지 초안을 복원한다.

## Primary Journey 3: Write A Monologue
1. 혼잣말 탭에서 `혼잣말 남기기`를 누른다.
2. 기분 태그를 선택하고 본문을 작성한다.
3. 공개 방법을 선택한다.
   - 요청형: 상대 요청 후 내가 승인
   - 시간차 공개: MVP 고정 옵션 `3일 후 공개`
4. 등록 전에 공개 방법과 상대에게 즉시 보이는 정보가 무엇인지 요약한다.
5. 등록 후 작성자 목록에는 본문과 공개 상태가 보인다.
6. 연결 전 작성한 혼잣말은 기본적으로 작성자 전용이며, 연결 시 자동 노출되지 않는다.

### Draft Rules
- 화면 이탈 시 로컬 임시 저장 여부를 묻지 않고 자동 임시 저장한다.
- 명시적으로 삭제하거나 등록하면 임시 저장을 제거한다.
- 10,000자를 상한으로 두고 남은 글자 수는 임계점 근처에서만 표시한다.

## Primary Journey 4: Request And Approve Access
1. 상대 혼잣말 목록에는 작성자 닉네임, 기분, 작성 상대 시각, 공개 상태만 보인다.
2. 잠긴 요청형 항목에서 `보고 싶다고 전하기`를 누른다.
3. 요청 후 버튼은 `요청을 보냈어` 상태로 바뀌고 중복 요청을 막는다.
4. 작성자는 알림 또는 혼잣말 탭의 요청함에서 요청을 확인한다.
5. 작성자는 `지금 보여주기` 또는 `조금 더 미루기`를 선택한다.
6. 승인 시 양쪽 목록이 공개 상태로 갱신되고 스레드 대화를 시작할 수 있다.
7. 미루기 시 상대에게 본문이나 이유는 노출하지 않고 `아직 준비 중이야` 상태만 전달한다.

### Request Safety
- 요청 취소는 요청자가 공개 전까지 가능하다.
- 작성자는 공개 후 MVP에서 다시 잠글 수 없다. 등록과 승인 직전에 이를 안내한다.
- 미루기 횟수 제한과 넛지는 P1 정책으로 두고, MVP에서는 무제한 미루기를 허용한다.

## Primary Journey 5: Timed Release
1. 작성자는 등록 시 `3일 후 공개`를 선택한다.
2. 상대 목록에는 기분과 `공개 예정` 상태만 보인다.
3. 작성자는 공개 전까지 본문 수정, 공개 방식 변경, 삭제가 가능하다.
4. 공개 예정 시각이 지나면 서버가 공개 상태로 전환한다.
5. 앱은 다음 동기화 또는 푸시 수신 시 공개 상태를 반영한다.

## Primary Journey 6: Opened Monologue Thread
1. 공개된 혼잣말 상세에서 원문을 읽는다.
2. 하단 스레드에서 해당 혼잣말에 한정된 대화를 이어간다.
3. 원문 작성자는 본문을 수정할 수 없고 삭제만 가능하다.
4. 삭제 시 상대에게는 `작성자가 이 혼잣말을 지웠어` 표시만 남고 스레드 입력을 닫는다.

## Screen Inventory
| Area | Screen | Core States |
|---|---|---|
| Auth | Welcome | default, loading |
| Auth | Social Login | idle, provider loading, cancelled, error |
| Onboarding | Profile Setup | empty, invalid, saving |
| Pairing | Pairing Hub | unpaired, invite active, joining |
| Pairing | Invite Confirmation | valid, expired, used, self, already paired |
| Chat | Conversation Home | no mood, checked in, no conversation, active, offline |
| Chat | Conversation History | loading, dates, empty, read-only |
| Monologue | My List | empty, draft, locked, requested, scheduled, opened |
| Monologue | Partner List | empty, locked, request pending, scheduled, opened |
| Monologue | Compose | draft, validation error, submitting |
| Monologue | Access Request Inbox | empty, pending, resolving |
| Monologue | Detail Thread | opened, deleted, offline |
| Together | Placeholder | paired, coming soon |
| My | Profile/Settings | default, notification permission state, sign out |

## Shared State Model

### Loading
- 첫 진입은 스켈레톤 대신 짧은 중립 로딩을 사용한다.
- 400ms 미만 응답에는 전체 화면 로딩을 표시하지 않는다.
- 버튼 제출은 해당 버튼만 잠그고 화면 전체 탐색은 유지한다.

### Empty
- 빈 화면에는 현재 상태 이유, 가능한 다음 행동 하나, 감정적으로 압박하지 않는 문구를 제공한다.
- 상대 행동을 기다리는 빈 화면은 새로고침을 반복 유도하지 않는다.

### Offline
- 기존 기록은 캐시에서 읽을 수 있다.
- 메시지와 혼잣말 등록은 `전송 대기`로 표시하되 공개 승인과 커플 연결은 온라인에서만 허용한다.
- 재연결 시 중복 등록되지 않도록 클라이언트 요청 ID를 사용한다.

### Error
- 내부 오류 코드나 상대의 비공개 상태를 추론할 정보를 노출하지 않는다.
- 재시도 가능한 오류와 사용자 입력 수정이 필요한 오류를 구분한다.

## Notification And Deep Link Routes
- 새 메시지 -> 해당 날짜 대화
- 상대 기분 체크인 -> 대화 탭 상단 상태
- 새 혼잣말 -> 상대 혼잣말 목록의 해당 항목
- 열람 요청 -> 작성자 요청함의 해당 항목
- 공개 승인/자동 공개 -> 혼잣말 상세
- 알림 미리보기에는 혼잣말 본문과 메시지 본문을 기본 포함하지 않는다.

## UX Risks
- `요청`이 압박으로 느껴질 수 있어 반복 요청과 공개 이유 요구를 금지한다.
- 연결 전 혼잣말 자동 공유는 신뢰를 깨뜨리므로 명시적 선택 없이는 공유하지 않는다.
- 앱 종료를 서버가 정확히 감지할 수 없으므로 사용자 경험은 `활성 입력 세션`과 `날짜 기록`을 구분해야 한다.
- 시간차 공개는 정확한 시각보다 `3일 후` 의미가 중요하므로 사용자 타임존 변경 규칙을 기술 계약에서 고정해야 한다.

## Handoff To UI And Frontend
- 각 화면은 주 행동 하나를 우선하고 공개 설정은 Bottom Sheet로 분리한다.
- 잠긴 본문은 흐림 처리나 길이 힌트 없이 렌더링 자체를 하지 않는다.
- 채팅과 혼잣말 스레드는 시각적으로 구분한다. 혼잣말 스레드는 원문 맥락을 항상 상단에 둔다.
- `미루기`, `삭제`, `공개`는 결과를 명확히 설명하는 확인 단계를 가진다.

