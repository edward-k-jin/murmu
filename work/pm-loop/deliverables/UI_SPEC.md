# Murmu P0 Mobile UI Specification

## Visual Intent
감정 기록은 차분하고 사적인 일기처럼, 상대와의 상호작용은 명확하고 부담 없이 보이게 한다. 따뜻한 라이트 배경을 유지하고 강조색은 핵심 행동과 선택 상태에만 사용한다.

## Global Layout
- 기본 화면 좌우 기준선: 20px
- 목록 밀집 화면: 16px, 단 상단 제목은 20px 기준 유지
- Safe Area 이후 상단 여백: 12px
- 화면 제목과 첫 콘텐츠 간격: 24px
- 주요 섹션 간격: 32px
- 카드 내부: 16px 또는 감정 원문 카드 20px
- 하단 고정 CTA: 좌우 20px, Safe Area 포함 하단 12px
- 키보드 표시 시 CTA/입력창은 키보드 위에 고정하고 본문은 스크롤 가능해야 한다.

## Typography Hierarchy
- Screen title: 22/30, 600
- Emotional hero: 28/36, 700, 최대 3줄
- Section title: 18/26, 600
- Body/emotional text: 16/26, 400
- Control label: 14/20, 600
- Metadata: 12/18, 500
- 한글 제목은 조사나 의미 단위가 한 글자만 다음 줄로 떨어지지 않도록 최대 너비를 조정한다.
- 혼잣말 본문은 최소 16/26으로 표시하고 중앙 정렬하지 않는다.

## App Shell

### Signed Out Stack
- 헤더 없는 전체 화면 Stack
- 뒤로가기는 플랫폼 기본 제스처를 유지하되 로그인 처리 중에는 중복 제출만 막는다.

### Paired Tabs
- 아이콘 + 라벨: 대화 / 혼잣말 / 함께 / 마이
- 높이: iOS Safe Area 포함, Android 최소 터치 영역 48px
- 활성 상태: primary 아이콘/텍스트, 비활성 상태: muted
- 탭 배경: surface, 상단 1px hairline, 그림자 없음
- 혼잣말 요청이 있으면 아이콘 우측 상단에 숫자 대신 작은 점을 사용한다.

## Screen Specifications

### Welcome
- 상단: 12px 브랜드 마크 + Murmu
- 중앙 상단 40%: 가치 문장, 최대 3줄
- 중단: 기분 칩 미리보기와 개인정보 원칙 카드
- 하단: Primary `시작하기`, Tertiary `로그인`
- 첫 화면에서 로그인 공급자 버튼을 모두 노출하지 않는다.

### Social Login
- 제목: `어떤 계정으로 시작할까?`
- Apple, Google 버튼은 플랫폼 브랜드 규칙을 따른다.
- 공급자 로딩 시 선택한 버튼만 로딩 상태로 전환한다.
- 취소는 오류 배너를 띄우지 않고 원상 복귀한다.

### Profile Setup
- 진행 표시: `1 / 2`
- 닉네임 입력은 자동 포커스하지 않아 화면 맥락을 먼저 읽을 수 있게 한다.
- 생년월일은 `나중에 입력` 가능하며 선택 사항임을 라벨에 표시한다.
- 키보드 위 Primary `다음`

### Pairing Hub
- 상단 설명: 둘이 연결되기 전에도 혼잣말을 쓸 수 있음을 안내한다.
- Primary `연인 초대하기`
- Secondary `초대코드 입력하기`
- Tertiary `먼저 둘러보기`
- 활성 초대가 있으면 코드 카드와 만료 시각, 공유/새 코드 만들기 행동을 제공한다.

### Invite Confirmation
- 상대 프로필은 닉네임과 텍스트 아바타만 표시한다.
- 질문: `{닉네임}님과 연결할까?`
- Primary `연결하기`, Secondary `아니야`
- 연결 성공은 400ms 이하 체크 모션 후 대화 탭으로 이동한다.

### Conversation Home
- 상단 큰 카드 대신 두 줄 상태 영역을 사용한다.
  - 내 기분: 선택/수정 가능한 Mood Chip
  - 상대 기분: 읽기 전용, 미체크인 시 중립 문구
- 날짜 제목과 히스토리 버튼은 같은 기준선에 둔다.
- 빈 상태 중앙: `오늘의 대화 시작하기`
- 활성 상태: 메시지 목록 + 하단 Composer
- 자정 전환 시 인라인 시스템 행 `새로운 하루가 시작됐어`를 표시하고 새 날짜로 이동한다.

### Message Composer
- 기본 높이 48, 최대 5줄까지 증가
- 좌측 보조 버튼은 기분 태그 선택
- `혼잣말로 남기기`는 더보기 메뉴에 두지 않고 입력창 위 작은 텍스트 행동으로 표시한다.
- 전송 가능 상태만 primary 아이콘을 사용한다.
- 오프라인 전송 대기는 메시지 하단 작은 상태 텍스트로 표현한다.

### Conversation History
- 날짜별 평면 목록, 카드 그리드 금지
- 각 행: 날짜, 마지막 메시지 시각, 메시지 수
- 지난 날짜 상세는 Composer 영역 대신 읽기 전용 안내 밴드를 표시한다.

### Monologue Home
- 상단 Segment: `내 혼잣말` / `상대의 혼잣말`
- Segment 아래 요청함 배너는 요청이 있을 때만 표시한다.
- Primary `혼잣말 남기기`는 하단 고정 버튼 또는 헤더 버튼 중 하나만 사용한다.
- 리스트 행은 기분, 상대 시각, 상태 라벨을 같은 순서로 유지한다.

### Locked Monologue Row
- 좌측 Mood Chip, 중앙 상태 문구, 우측 가능한 행동
- 본문 자리, 흐림, 줄 수, 글자 길이를 암시하는 회색 블록을 렌더링하지 않는다.
- 요청 전: `보고 싶다고 전하기`
- 요청 후: 비활성 `요청을 보냈어`
- 미뤄짐: `아직 준비 중이야`, 재요청 버튼 없음

### Compose Monologue
- 상단 제목과 닫기
- 기분 선택
- 테두리 없는 큰 본문 입력 영역, 최소 높이 화면의 35%
- 공개 방식 요약 행을 누르면 Bottom Sheet 표시
- 하단 Primary `혼잣말 남기기`
- 글자 수는 9,000자부터 표시
- 임시 저장 상태는 헤더 아래 조용한 메타 텍스트로 표시한다.

### Visibility Bottom Sheet
- 선택 1: `내가 허락할 때 보여주기`
- 선택 2: `3일 후 자동으로 보여주기`
- 각 선택 아래 상대에게 즉시 보이는 정보와 변경 가능 시점을 설명한다.
- 선택 후 별도 저장 버튼 없이 시트를 닫고 작성 화면 요약을 갱신한다.

### Access Request Inbox
- 요청별 감정 태그와 요청 시각만 표시한다.
- 행 선택 시 확인 시트에서 원문을 작성자에게만 보여준다.
- Primary `지금 보여주기`
- Secondary `조금 더 미루기`
- 공개는 되돌릴 수 없음을 Primary 바로 위에 표시한다.

### Opened Monologue Detail
- 상단 원문 영역은 surfaceSoft가 아닌 canvas 위 평면 레이아웃
- 기분/작성 시각 메타 뒤 본문
- hairline으로 스레드와 분리
- 스레드 Composer는 일반 채팅과 같은 높이지만 배경색을 surfaceSoft로 구분한다.

### Together Placeholder
- P0 기능을 과장하지 않는다.
- 최근 기분 기록 3개와 `더 많은 기록은 준비 중이야` 문구만 제공한다.

### My
- 프로필, 커플 연결 상태, 알림, 개인정보, 로그아웃
- 위험 행동은 화면 하단 별도 섹션
- 연결 해제는 정책 확정 전 노출하지 않는다.

## Component Contracts

### Buttons
- Primary: 52px, radius 12, full width by default
- Secondary: 52px, 1px hairline
- Tertiary: 최소 48px touch target, 텍스트 밑줄 없음
- Destructive: 빨간 배경 대신 danger 텍스트 + 확인 시트

### Mood Chip
- 높이 40px, radius full
- 아이콘/이모지 + 텍스트를 함께 사용한다.
- 선택 상태는 primarySoft 배경과 primaryPressed 텍스트
- 한 행에서 4개를 강제하지 않고 가로 스크롤 또는 줄바꿈한다.

### State Banner
- 정보: surfaceSoft + body text
- 경고: warning 10% tint + warning text
- 오류: danger 8% tint + danger text
- 닫기보다 상태 해결 행동을 우선한다.

### Confirmation Sheet
- 제목은 결과 중심으로 작성한다.
- 설명, Primary, Secondary 순서
- 위험 행동도 버튼 위치를 바꾸지 않아 근육 기억을 유지한다.

## Motion And Haptics
- 화면 전환: 플랫폼 기본 Stack
- Bottom Sheet: 220ms
- Chip 선택: 색 전환 160ms, scale 없음
- 연결/공개 성공: success haptic 1회
- 일반 탭과 메시지 전송에는 햅틱을 사용하지 않는다.
- Reduce Motion에서는 커스텀 성공 모션을 정적 아이콘으로 대체한다.

## Accessibility Detail
- 동적 글자 크기 200%에서 CTA와 상태 설명이 잘리지 않아야 한다.
- Segment와 Mood Chip은 역할, 선택 여부, 텍스트 라벨을 제공한다.
- 잠긴 혼잣말 라벨: `상대의 혼잣말, 기분 설렘, 내용은 비공개, 열람 요청 가능` 수준으로 제한한다.
- 최소 48x48px 터치 영역
- 키보드 포커스 순서는 제목 -> 입력 -> 보조 설정 -> Primary 행동

## UI Detail Checklist
- 화면 제목, 설명, 리스트, CTA의 좌측 기준선이 일치하는가
- 한국어 제목이 조사나 한 글자로 어색하게 줄바꿈되지 않는가
- 카드가 필요 없는 평면 목록에 카드가 남용되지 않았는가
- Primary CTA 주변에 최소 16px 이상의 호흡 공간이 있는가
- 잠긴 본문의 형태나 길이가 시각/접근성 트리에 존재하지 않는가
- 키보드, Safe Area, Android 뒤로가기에서 주요 행동이 가려지지 않는가
- 오프라인/로딩/오류가 색만으로 표현되지 않는가

## Handoff To Frontend
- 먼저 Auth/Profile/Pairing 화면을 세로 슬라이스로 구현한다.
- 공용 컴포넌트는 Button, MoodChip, StateBanner, ConfirmationSheet만 선행한다.
- 모든 화면을 범용 Card 컴포넌트로 추상화하지 않는다.
- 실제 카피는 Copywriter 검토 전 임시로 두되 상태 의미는 바꾸지 않는다.

