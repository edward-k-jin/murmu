# Murmu P0 1:1 Space Mobile UI Specification

## Visual Intent
한 사람과의 속마음을 다루는 조용한 공간으로 보이게 한다. 현재 1:1 공간과 공개 상태는 명확하게, 감정 본문은 일기처럼 편안하게 표현한다.

## Global Layout
- 기본 좌우 기준선 20px, 조밀한 멤버/피드 목록은 16px
- Safe Area 이후 상단 여백 12px
- 화면 제목과 첫 콘텐츠 24px, 주요 섹션 32px
- 하단 고정 CTA는 좌우 20px, Safe Area 포함 하단 12px
- 키보드 표시 시 작성 CTA와 스레드 입력창은 키보드 위에 유지한다.

## App Shell
- Signed Out: Welcome 1 → Welcome 2 → Welcome 3/Login → Profile Setup
- Signed In 상단: `Space Switcher` + 화면별 보조 행동
- 하단 탭: `공간` / `혼잣말` / `나`
- 공간 전환기는 최소 48px 터치 영역이며 공간 이름, 화살표, 읽지 않은 점을 표시한다.
- 새 공간 데이터 로딩 전 이전 공간 콘텐츠를 유지하지 않고 중립 로딩으로 교체한다.

## Screen Specifications

### Welcome
- 브랜드명은 `Murmu`
- 3단계 온보딩으로 친한 사람에게도 바로 말하기 어려운 마음을 안전하게 남기고, 작성자가 공개 시점을 통제한다는 가치를 전달한다.
- 화면 노출 문구는 친근하지만 반말이 아닌 부드러운 존댓말을 사용한다.
- 1단계는 친구나 연인 사이에서 불편한 마음과 전하고 싶은 이야기를 먼저 혼잣말로 남길 수 있음을 설명한다.
- 2단계는 공개 전까지 본문이 상대에게 보이지 않고, 작성자가 마음이 정리된 시점에 공개할 수 있음을 설명한다.
- 3단계는 1:1 공간 시작을 안내하고 Apple/Google 로그인만 제공한다.
- 1~2단계 하단 Primary `다음`
- 3단계 CTA `Apple로 계속하기`, `Google로 계속하기`

### Profile Setup
- 닉네임만 필수, 1~20자
- 생년월일 입력은 제거한다.
- 하단 Primary `계속하기`

### Space Start
- 제목 `누구와 마음을 나눌까?`
- Primary `1:1 공간 만들기`
- Secondary `초대코드로 들어가기`
- 한 공간에는 두 명만 함께할 수 있다는 설명을 행동 아래에 둔다.

### Create Space
- 공간 이름 1~30자
- 초대한 한 사람과만 혼잣말과 대화를 나눌 수 있음을 안내한다.
- Primary `1:1 공간 만들기`

### Invite Share
- 공간 이름, 현재 인원 `1 / 2`, 만료 시각
- Primary `초대 링크 공유하기`, Secondary `코드 복사하기`
- 신규 멤버가 과거 공개 기록도 볼 수 있다는 안내를 항상 표시한다.

### Invite Preview
- 공간 이름, 만든 사람 닉네임, 현재 인원만 표시
- 참여하면 이전 공개 기록도 볼 수 있음을 안내한다.
- Primary `이 공간에 참여하기`
- 정원 초과 시 `이미 두 명이 함께하는 공간이야` 상태

### Space Switcher Sheet
- 현재 공간은 선택 표시
- 각 행: 공간 이름, 활성 인원, 읽지 않은 점
- 하단: `새 1:1 공간 만들기`, `초대코드로 들어가기`
- 공간명은 한 줄 말줄임, 접근성 라벨에는 전체 이름 제공

### Monologue Feed
- Group Switcher와 피드 본문의 기준선을 맞춘다.
- 평면 리스트를 사용하고 항목 사이 hairline 또는 24px 여백 중 하나만 사용한다.
- Primary `혼잣말 남기기`는 한 곳에만 둔다.

### Published Monologue Item
- 작성자 닉네임, 기분, 상대 시각
- 본문 최대 5줄 미리보기
- 스레드 메시지 수와 마지막 활동 시각
- 나간 작성자는 기존 닉네임과 `이전 상대` 보조 상태 표시

### Locked Monologue Item
- 작성자 닉네임, 기분, `공개 예정 {날짜}`
- 본문 자리, 흐림, 길이 placeholder를 렌더링하지 않는다.
- 작성자에게만 `수정` / `예약 취소` 제공

### Compose Monologue
- 상단에 현재 공간명과 `상대에게 공개돼` 설명
- 기분 → 큰 본문 입력 → 공개 시점 순서
- 본문 최소 높이 화면의 35%, 1~10,000자
- 작성 중 공간 전환은 막고 닫은 뒤 변경하도록 안내한다.
- 제출 확인 제목에 공간명을 포함한다.

### Publish Timing Sheet
- `지금 공개하기`
- `날짜를 정해 공개하기`
- 예약 선택 시 하단 시트에서 날짜/시간을 선택하고 사용자 시간대 기준으로 표시
- 예약 가능 기간은 최대 7일이며, 시트와 입력 카드에 이를 설명한다.
- 서버 현재 시각 이전 값은 선택 불가

### Monologue Detail Thread
- 원문은 canvas 위 평면 레이아웃, 본문 16/26 이상
- hairline 아래 스레드 목록과 48px 이상 입력창
- 독립 채팅처럼 보이지 않게 원문 맥락을 상단에 유지한다.
- 탈퇴 작성자의 프로필 진입은 막는다.

### Space Tab
- 연결된 1:1 공간 목록을 보여준다.
- 공간이 1개뿐이어도 빈 목록처럼 보이지 않게 현재 공간 카드와 빠른 행동을 제공한다.
- 각 공간 카드는 공간 이름, 내 역할, 현재 인원, 선택 상태, 혼잣말 진입 행동을 표시한다.
- 새 공간 만들기와 초대코드 참여를 상단 빠른 행동으로 제공한다.
- 현재 공간의 기분 체크인과 상대 현황은 공간 카드 또는 공간 상세에서 진입한다.

### Member Remove Confirmation
- 제목 `{닉네임}님을 그룹에서 내보낼까?`
- 기존 공개 기록은 남고 미공개 예약은 취소됨을 설명한다.
- Destructive `내보내기`, Secondary `취소`
- 사유 입력은 제공하지 않는다.

### Leave Group Confirmation
- 접근 즉시 상실, 공개 기록 유지, 예약 취소를 설명한다.
- 다른 멤버가 있는 관리자에게는 탈퇴 버튼 대신 차단 이유를 표시한다.

### My
- 프로필, 알림, 개인정보와 보안, 로그아웃
- 공간 생성과 초대코드 참여는 제공하지 않는다. 해당 행동은 Space Tab과 Space Switcher에만 둔다.
- 알림 설정에는 전체 푸시, 새로 공개된 혼잣말, 내 예약 혼잣말 공개, 스레드 답장, 초대와 공간 변경, 기분 체크인 리마인더를 제공한다.
- 알림 권한이 꺼져 있으면 OS 설정으로 이동하는 행동을 제공한다.
- 잠금 화면에는 혼잣말 본문, 답장 내용, 글자 수, 미리보기를 노출하지 않는다는 안내를 표시한다.
- 공간 관리는 Space Tab과 Space Switcher에서만 제공한다.

## Component Contracts

### Group Switcher
- 높이 48px, 최대 너비 화면의 70%
- 카드가 아닌 텍스트 버튼 형태
- 그룹 변경 중 spinner와 이름 placeholder 사용

### Mood Chip
- 높이 40px, radius full
- 이모지와 텍스트 동시 제공
- 선택 상태는 primarySoft와 primaryPressed

### Confirmation Sheet
- 결과 중심 제목, 설명, Primary, Secondary 순서
- 탈퇴·강퇴 영향은 세 항목 이내로 요약

### Unread Indicator
- 숫자 대신 6px primary 점
- 접근성 문구 `읽지 않은 활동 있음`

## Motion And Feedback
- 그룹 전환 160ms fade, 좌우 slide 금지
- 하단 탭 선택 pill은 160ms ease-out으로 이동한다.
- 카드 press feedback은 opacity 대신 scale 0.985 또는 surfaceSoft 변화 중 하나를 사용한다.
- Bottom Sheet 220ms
- 생성/참여/게시 성공에 success haptic 1회
- 강퇴/탈퇴에는 햅틱을 사용하지 않는다.

## Accessibility
- Dynamic Type 200%에서 그룹명, CTA, 상태 설명이 잘리지 않아야 한다.
- 그룹 전환기 라벨: `현재 그룹 {이름}, 그룹 변경`
- 잠긴 항목 라벨: `혼잣말, 작성자 {닉네임}, 기분 {기분}, {날짜} 공개 예정, 내용 비공개`
- 최소 48x48px 터치 영역
- 잠긴 본문은 접근성 트리에도 존재하지 않는다.

## UI Detail Checklist
- Group Switcher, 화면 제목, 피드 본문의 좌측 기준선이 정렬되는가
- 작성 화면과 제출 확인에 동일한 그룹명이 보이는가
- 긴 한국어 그룹명이 CTA를 밀어내지 않는가
- 카드가 피드 전체에 남용되지 않았는가
- 잠긴 본문의 길이를 추론할 요소가 없는가
- 키보드와 Safe Area에서 작성/전송 행동이 가려지지 않는가

## Handoff To Frontend
- Button, GroupSwitcher, MoodChip, StateBanner, ConfirmationSheet부터 구현한다.
- route/query/draft key에 `groupId`가 없으면 그룹 데이터를 렌더링하지 않는다.
- Auth → Group Start → Create/Join → Group Switcher를 첫 세로 슬라이스로 구현한다.
