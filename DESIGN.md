# Murmu Mobile Design System

## Direction
따뜻하고 안전한 감정 공간을 만든다. Airbnb의 라이트 톤과 여백을 기반으로 하되, Linear처럼 인터랙션과 장식을 절제한다. 참고 자료는 브랜드 영감용이며 공식 디자인을 복제하지 않는다.

## Mobile Translation
- 웹 히어로, 카드 그리드, 마케팅 내비게이션은 사용하지 않는다.
- iOS/Android 안전 영역과 키보드, 뒤로가기, 하단 탭 동작을 우선한다.
- 화면 좌우 기본 여백은 20px, 조밀한 목록은 16px를 사용한다.
- 모든 주요 터치 영역은 최소 48x48px로 만든다.
- 본문은 한 화면에 하나의 핵심 행동만 강하게 보이도록 구성한다.

## Colors
- `canvas`: `#FFFDFC`
- `surface`: `#FFFFFF`
- `surfaceSoft`: `#F8F5F3`
- `ink`: `#252223`
- `body`: `#4E494B`
- `muted`: `#777174`
- `hairline`: `#E9E3E1`
- `primary`: `#E85D75`
- `primaryPressed`: `#D94B65`
- `primarySoft`: `#FDECEF`
- `positive`: `#3E8A68`
- `warning`: `#A86D22`
- `danger`: `#B94343`
- 강조색은 한 화면 면적의 10% 이하로 사용한다.

## Typography
- 한글: Pretendard Variable
- iOS fallback: system font
- Android fallback: sans-serif
- `display`: 28/36, 700
- `titleLarge`: 22/30, 650
- `title`: 18/26, 600
- `body`: 16/24, 400
- `bodySmall`: 14/20, 400
- `label`: 14/20, 600
- `caption`: 12/18, 500
- 감정 문장은 과도하게 굵게 만들지 않고 행간으로 편안함을 준다.

## Spacing And Shape
- spacing: 4, 8, 12, 16, 20, 24, 32, 40
- input radius: 12
- card radius: 16
- sheet radius: 24
- pill은 기분 태그와 작은 상태에만 사용한다.
- 그림자는 모달과 떠 있는 작성 버튼에만 약하게 사용한다.

## Interaction
- 일반 상태 전환: 160ms ease-out
- 화면/시트 전환: 220ms ease-in-out
- 누름 피드백: scale 0.98 또는 surface 색 변화 중 하나만 사용
- 성공 애니메이션: 최대 400ms, 반복 금지
- 장식 목적의 패럴랙스, 글로우, 연속 펄스는 금지한다.
- 햅틱은 작성 완료, 공개 승인, 연결 성공 같은 중요한 확정 행동에만 사용한다.

## Core Components
- Primary button: 높이 52, radius 12, primary 배경
- Secondary button: 높이 52, surface 배경, 1px hairline
- Text input: 최소 높이 52, radius 12, 명확한 label/error
- Mood chip: 최소 높이 40, 선택 시 primarySoft + primary 텍스트
- Emotion card: surface, radius 16, border 중심, 그림자 없음
- Locked monologue row: 기분과 작성 시각만 표시하고 본문 공간 자체를 렌더링하지 않는다.
- Bottom sheet: 공개 설정, 요청 수락/미루기처럼 집중 선택이 필요한 흐름에 사용한다.

## Navigation
- 하단 탭: 대화, 혼잣말, 함께, 마이
- 혼잣말 작성은 탭 내부의 명확한 primary action으로 둔다.
- 잠긴 콘텐츠는 자물쇠 장식보다 상태 설명과 가능한 다음 행동을 우선한다.
- 과거 날짜 채팅은 입력 영역을 제거하고 열람 전용 상태를 명시한다.

## Accessibility
- 본문 대비 4.5:1 이상, 큰 텍스트 3:1 이상을 목표로 한다.
- 색만으로 기분, 잠금, 오류 상태를 전달하지 않는다.
- 동적 글자 크기에서 핵심 행동과 본문이 잘리지 않아야 한다.
- Reduce Motion 사용 시 scale/slide 모션을 fade로 대체한다.
- 스크린리더 라벨에 상대의 비공개 본문을 포함하지 않는다.

## Do Not
- 카드로 모든 정보를 감싸지 않는다.
- 분홍색을 화면 전체 배경이나 긴 텍스트에 사용하지 않는다.
- Airbnb 웹 레이아웃이나 Linear 다크 마케팅 화면을 복제하지 않는다.
- 잠긴 혼잣말의 본문 길이, 미리보기, 접근성 라벨을 노출하지 않는다.

