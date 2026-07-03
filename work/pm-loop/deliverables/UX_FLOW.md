# Murmu P0 1:1 Space UX Flow

## UX Goal
두 사람이 여러 폐쇄 1:1 공간을 혼동 없이 오가면서, 속마음은 작성자가 정한 시점까지 보호하고 공개 후에는 해당 상대와의 대화 맥락으로 남긴다.

## Navigation Model

### Signed Out
- Welcome 1: 혼잣말의 가치 안내
- Welcome 2: 공개 통제권 안내
- Welcome 3/Login: Apple/Google 로그인
- Profile Setup

### Signed In Without Spaces
- Space Start: `1:1 공간 만들기` / `초대코드로 들어가기`
- 실제 공간 없이 작성한 혼잣말은 저장하지 않고 제품 예시만 제공한다.

### Signed In With Spaces
- 현재 1:1 공간을 앱 전역 컨텍스트로 선택한다.
- 상단 공간 전환기에서 공간 목록, 읽지 않은 상태, 새 공간 만들기, 초대 참여를 제공한다.
- 하단 탭은 `공간` / `혼잣말` / `나`다.
- 피드, 기분, 알림 배지, 작성 초안은 선택한 공간에 종속된다.

## Journey 1: Create A 1:1 Space
1. 공간 이름을 입력한다.
2. 정원 2명과 생성자가 초대 권한을 가진다는 점을 확인한다.
3. 생성 즉시 만든 사람 1인의 활성 공간이 만들어진다.
4. 초대코드 또는 링크를 발급해 시스템 공유 시트로 공유한다.
5. 공간은 현재 공간으로 선택되고 빈 혼잣말 피드를 보여준다.

## Journey 2: Join A 1:1 Space
1. 딥링크 또는 코드로 초대를 연다.
2. 참여 전에는 공간 이름, 만든 사람 닉네임, 현재 인원만 본다.
3. 참여 확정 시 서버가 초대 상태와 2인 정원을 다시 검사한다.
4. 참여 후 가입 이전의 공개 기록과 잠긴 혼잣말 메타데이터를 볼 수 있다.
5. 예약 공개 전 본문은 가입 시점과 무관하게 보이지 않는다.

### Join Errors
- 만료, 폐기, 존재하지 않는 코드를 구분한다.
- 이미 가입한 공간이면 해당 공간으로 이동한다.
- 이미 두 명이 함께하는 공간이면 참여를 막는다.

## Journey 3: Switch Spaces
1. 상단 현재 공간 이름을 누른다.
2. 공간 선택 시트에서 공간별 읽지 않은 상태를 본다.
3. 선택 즉시 피드와 탭 상태를 새 공간 컨텍스트로 교체한다.
4. 작성 초안은 공간별로 보존하며 서로 섞지 않는다.
5. 딥링크가 다른 가입 공간을 가리키면 공간 전환 안내 후 목적 화면으로 이동한다.

## Journey 4: Write And Publish
1. 현재 1:1 공간이 명확히 표시된 작성 화면을 연다.
2. 기분과 본문을 입력한다.
3. `지금 공개` 또는 `날짜를 정해 공개`를 선택한다.
4. 제출 전에 공개 대상이 현재 상대임을 확인한다.
5. 즉시 공개하면 피드에 본문이 나타나고 스레드가 열린다.
6. 예약 공개는 최대 7일 뒤까지만 선택할 수 있고, 기분, 잠김 상태, 공개 예정일만 피드에 나타난다.
7. 공개 전 작성자는 수정, 일정 변경, 취소할 수 있다.

## Journey 5: Read And Discuss
1. 활성 멤버는 가입 이전을 포함한 공간의 공개 혼잣말을 읽는다.
2. 잠긴 항목은 기분과 상태만 보며 본문 길이와 미리보기를 노출하지 않는다.
3. 공개된 상세에서 두 사용자가 스레드 메시지를 남긴다.
4. 탈퇴한 작성자의 공개 기록은 작성자 닉네임과 함께 유지된다.

## Journey 6: Daily Mood
1. 공간 화면에서 현재 1:1 공간의 기분 상태로 들어가 오늘 기분을 선택한다.
2. 기분 체크인은 공간별로 독립적이다.
3. 상대 목록에서 각자의 오늘 기분과 체크인 여부를 본다.
4. 탈퇴·강퇴된 멤버는 현재 멤버 목록에서 제거한다.

## Journey 7: Leave Or Remove

### Member Leaves
1. 상대가 공간 설정에서 나가기를 선택한다.
2. 접근 상실, 공개 기록 유지, 미공개 예약 취소 결과를 확인한다.
3. 서버 처리 완료 즉시 공간 목록, 캐시, 알림 대상에서 제거된다.
4. 다른 공간이 있으면 마지막 사용 공간으로, 없으면 Space Start로 이동한다.

### Creator Removes The Other Participant
1. 만든 사람이 상대 상세에서 내보내기를 선택한다.
2. 동일한 접근 상실과 콘텐츠 처리 결과를 확인한다.
3. 제거된 사용자는 해당 공간 딥링크에서도 접근 거부 상태를 본다.

### Admin Leaves
- 다른 활성 멤버가 있으면 만든 사람의 나가기 행동을 비활성화하고 이유를 설명한다.
- 만든 사람 혼자 남은 경우 `공간 종료` 흐름으로 진입한다. 보존 기간 확정 전 실제 종료 구현은 보류한다.

## Screen Inventory
| Area | Screen | Core States |
|---|---|---|
| Auth | Welcome 1-3/Login/Profile | idle, loading, cancelled, error |
| Groups | Group Start | no groups, create, join |
| Groups | Create Group | empty, invalid, submitting, success |
| Groups | Invite Preview | valid, expired, full, already joined |
| Global | Group Switcher | one group, multiple groups, unread |
| Monologue | Group Feed | empty, locked, scheduled, opened, offline |
| Monologue | Compose | group draft, immediate, scheduled, submitting |
| Monologue | Detail Thread | opened, departed author, deleted, offline |
| Group | Member Mood List | checked in, missing, loading |
| Group | Member Management | admin, member, remove confirmation |
| Group | Leave/Remove Result | success, revoked, conflict |
| My | Profile/Settings | notification state, sign out |
| My | Notification Settings | permission needed, enabled, disabled, quiet reminder |

## Shared State Rules
- 모든 주요 화면에서 현재 그룹을 식별할 수 있어야 한다.
- 그룹 변경 중 이전 그룹 콘텐츠를 새 그룹 이름 아래 렌더링하지 않는다.
- 캐시 키와 로컬 초안 키는 `groupId`를 포함한다.
- 탈퇴·강퇴 이벤트 수신 시 해당 그룹 화면을 닫고 로컬 캐시를 제거한다.
- 민감 본문은 장기 오프라인 저장하지 않는다.
- 푸시 알림은 권한이 없어도 핵심 사용을 막지 않는다.
- 푸시 알림에는 혼잣말 본문, 답장 본문, 본문 길이, 미리보기를 포함하지 않는다.

## UX Risks
- 잘못된 그룹에 속마음을 게시하는 실수를 막기 위해 작성 화면과 제출 확인에 그룹명을 반복한다.
- 신규 멤버의 과거 기록 열람은 초대 생성과 참여 확인 화면 모두에서 알린다.
- 강퇴 사유 입력이나 그룹 공개 알림은 P0에서 요구하지 않는다.
- 탈퇴한 작성자의 이름 보존은 개인정보 삭제 요청 정책과 별도 검토가 필요하다.

## Handoff
UI Designer는 그룹 전환기, 그룹 식별이 명확한 작성 화면, 멤버 관리 확인 시트를 설계한다. Frontend는 모든 query, draft, navigation key에 `groupId`를 포함하고 멤버십 종료 시 캐시를 폐기한다.
