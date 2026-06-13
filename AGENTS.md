# Murmu Agent Workflow

## Communication
- 진행 상황과 답변은 친근한 반말의 한국어로 작성한다.
- 사용자는 리더 에이전트와만 소통한다.
- 제품 방향, 법적 위험 수용, 파괴적 변경, 배포 승인만 사용자에게 확인한다.

## Product Direction
- iOS와 Android 앱을 동시에 제공한다.
- React Native + Expo Development Build + TypeScript를 사용한다.
- Expo Go 전용 API나 웹 전용 레이아웃에 의존하지 않는다.
- 백엔드는 Supabase Auth, Postgres, Realtime, Edge Functions를 우선 사용한다.
- 핵심 제품 원칙은 "감정 표현은 무료, 공개 통제권은 작성자에게"다.

## Design Direction
- Airbnb에서 따뜻한 라이트 톤, 타이포 위계, 넉넉한 여백, 부드러운 곡률을 차용한다.
- Linear에서 절제된 모션, 희소한 강조색, 얇은 경계, 즉각적인 상태 피드백을 차용한다.
- 두 브랜드의 웹 레이아웃은 복제하지 않는다. 모바일 네이티브 IA와 플랫폼 관례로 재구성한다.
- 상세 기준은 `DESIGN.md`를 단일 기준으로 사용한다.

## Required Order
1. Planner: PRD, 범위, 수용 기준, 열린 결정 정리
2. Designer + Backend: 파일 충돌이 없을 때 병렬 진행
3. App: 디자인 토큰과 API 계약을 읽고 React Native 구현
4. Copy: 사용자 문구 정리
5. QA: 수용 기준, 회귀, 접근성, 실제 기기 동작 검증
6. Security/Legal: 인증, RLS, 개인정보, 알림 내용 검토
7. Release: 변경 기록과 배포 체크리스트 정리

## File Ownership
- Leader/Planner: `AGENTS.md`, `PROGRESS.md`, `docs/PRD.md`, `docs/OPS/**`
- Designer: `DESIGN.md`, `docs/UX_FLOW.md`, `docs/design-tokens.md`
- Backend: `supabase/**`, `docs/api-interface.md`, 데이터 모델 문서
- App: `app/**`, 앱 테스트와 설정 파일
- QA: `docs/QA.md`, 테스트 시나리오와 테스트 파일
- Security/Legal: `docs/COMPLIANCE_CHECKLIST.md`, 보안 검토 문서
- Release: `docs/CHANGELOG.md`, `docs/RELEASE_NOTES.md`, `docs/PROJECT_STATE.md`
- 같은 파일을 여러 역할이 동시에 수정하지 않는다.

## Engineering Rules
- 도메인 규칙은 UI 컴포넌트가 아니라 테스트 가능한 서비스/도메인 계층에 둔다.
- 사용자, 커플, 혼잣말, 채팅 데이터는 Supabase RLS를 기본 거부 방식으로 보호한다.
- 혼잣말 본문은 공개 조건을 만족하기 전 상대 사용자 쿼리에 포함하지 않는다.
- 날짜와 공개 시점은 서버 시간을 기준으로 저장하고, 표시는 사용자 시간대로 변환한다.
- 새 의존성은 React Native New Architecture 및 현재 Expo SDK 호환성을 확인한다.
- 완료 조건은 lint, typecheck, unit test, build 통과다.

## Agent Handoff
각 역할은 완료할 때 아래 내용을 남긴다.
- 변경 파일 목록
- 결정 이유와 남은 위험
- 실행한 검증과 결과
- 다음 역할이 읽어야 할 계약 또는 문서

## Approval Gates
- Gate 0: 계획과 기술 방향
- Gate 1: PRD와 MVP 수용 기준
- Gate 2: UX 흐름과 디자인 시스템
- Gate 3: 데이터 모델, API, RLS
- Gate 4: 앱 구현
- Gate 5: QA와 보안/컴플라이언스
- Gate 6: 앱스토어 배포

