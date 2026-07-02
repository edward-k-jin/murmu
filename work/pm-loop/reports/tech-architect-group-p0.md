# Role Report

## Role
Tech Architect

## Task
다중 그룹 데이터 모델, 관리자 권한, 기록 가시성, 예약 공개 취소와 구현 순서를 정의한다.

## Inputs Used
- `PROJECT_BRIEF.md`
- 결정 로그 `0006`~`0008`
- 기존 Supabase 구현과 RLS 계약

## Findings
- 권한은 콘텐츠 생성 당시가 아니라 현재 활성 멤버십으로 판정해야 한다.
- 탈퇴/강퇴와 예약 혼잣말 취소는 동일 트랜잭션이어야 한다.
- 기존 couple 스키마를 범용화하기보다 새 group 스키마를 만드는 편이 안전하다.
- 재가입 이력을 보존하려면 멤버십은 독립 id와 active partial unique index가 필요하다.

## Risks
- 유료 정원 적용 방식을 클라이언트가 결정하면 무료 정원을 우회할 수 있다.
- Realtime과 푸시가 전송 시점 멤버십을 재검사하지 않으면 탈퇴자에게 데이터가 전달될 수 있다.
- 그룹 종료 보존 정책 확정 전 실제 데이터 삭제를 구현하면 복구 불가능한 결정이 된다.

## Recommendation
group-prefixed 신규 테이블과 RPC를 추가하고 부정 RLS 테스트를 먼저 작성한다. 정원, 탈퇴, 강퇴, 예약 취소는 모두 잠금 기반 RPC로 강제한다.

## Handoff
Backend Engineer는 TECH_SPEC 검증 게이트를 실패 테스트로 먼저 구현한다. 기존 couple migration은 교체 검증 전 삭제하지 않는다.

## Confidence
High

## Next Suggested Agent
PM Orchestrator and Backend Engineer
