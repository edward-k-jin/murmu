# Role Report

## Role
UX Designer

## Task
P0 온보딩, 커플 연결, 채팅, 혼잣말의 사용자 흐름과 상태 모델을 정의한다.

## Inputs Used
- `work/pm-loop/PROJECT_BRIEF.md`
- `docs/PRD.md`
- `DESIGN.md`

## Findings
- 채팅은 즉시성을, 혼잣말은 작성자 통제와 의도적인 확인 단계를 우선해야 한다.
- 연결 전 사용자가 혼잣말을 작성할 수 있어야 하지만 연결 시 자동 공유되면 안 된다.
- 앱 종료 기반 세션과 날짜별 기록은 사용자에게 같은 개념으로 보이면 혼란이 생긴다.

## Risks
- 반복 열람 요청이 감정적 압박으로 작동할 수 있다.
- 잠긴 본문을 흐림 처리하면 길이나 형태가 노출될 수 있다.
- 시간차 공개와 공개 후 삭제의 결과를 충분히 설명하지 않으면 신뢰가 깨진다.

## Recommendation
MVP에서 미루기는 무제한 허용하고 반복 넛지는 P1로 미룬다. 연결 전 혼잣말은 작성자 전용으로 유지한다. 공개 전후 행동에는 결과 확인 단계를 둔다.

## Handoff
UI Designer는 화면별 핵심 행동 하나, 잠긴 본문 비렌더링, 상태별 빈 화면과 확인 시트를 구체화한다. Frontend는 로컬 임시 저장과 요청 ID 기반 재시도를 지원한다.

## Confidence
High

## Next Suggested Agent
UI Designer

