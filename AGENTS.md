# Murmu Agent Workflow

## Workflow Source
- PM 운영은 `codex-agent-workflows`의 `pm-loop` 규칙을 따른다.
- 긴 대화 기록 대신 `work/pm-loop/PROJECT_BRIEF.md`, 역할 보고서, 결정 로그를 인계 기준으로 사용한다.
- 현재 단계에 필요한 역할 계약만 읽고 전체 에이전트 라이브러리를 한꺼번에 로드하지 않는다.
- 재사용 가능한 워크플로우 메모리는 사용자 승인 없이 추가하지 않는다.

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
1. PM: 프로젝트 브리프, 에이전트 계획, 현재 상태 갱신
2. UX + Tech Architect: 독립 파일에서 병렬 진행
3. PM: 보고서를 검토하고 Proceed/Revise/Stop/Ask User 결정 기록
4. UI + Backend: UX와 아키텍처 계약을 입력으로 상세 명세
5. Frontend: 승인된 디자인과 API 계약으로 React Native 구현
6. Copy + UI Detail: 문구와 시각 디테일 검토
7. QA + Security + Accessibility: 재현 가능한 이슈 보고와 재검증
8. Release: 변경 기록과 배포 체크리스트 정리

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
- `work/pm-loop/reports/`에 Role, Task, Inputs Used, Findings, Risks, Recommendation, Handoff, Confidence, Next Suggested Agent를 기록한다.
- PM은 다음 역할 실행 전에 `work/pm-loop/decisions/`에 결정과 인계 범위를 기록한다.
- 다음 역할은 `PROJECT_BRIEF.md`, 관련 결정 로그, 직접 필요한 산출물만 읽는다.

## Defect Rework
- Requirement Gap -> PRD/Product
- UX Flow Issue -> UX
- Visual/UI Issue -> UI 또는 Frontend
- Frontend Bug -> Frontend
- Backend Bug -> Backend
- Security Issue -> Security와 담당 Engineer
- Accessibility Issue -> Accessibility와 Frontend
- Unknown/Cross-cutting -> Tech Architect
- Critical/High 이슈가 수정 또는 명시적으로 수용되고 대상 재검증이 통과할 때까지 반복한다.

## Approval Gates
- Gate 0: 계획과 기술 방향
- Gate 1: PRD와 MVP 수용 기준
- Gate 2: UX 흐름과 디자인 시스템
- Gate 3: 데이터 모델, API, RLS
- Gate 4: 앱 구현
- Gate 5: QA와 보안/컴플라이언스
- Gate 6: 앱스토어 배포
