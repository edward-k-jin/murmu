# Role Report

## Role
Backend Engineer

## Task
그룹 P0 API, RLS, 인덱스와 검증 계약을 상세화한다.

## Inputs Used
- `deliverables/TECH_SPEC.md`
- `deliverables/UX_FLOW.md`
- 기존 Supabase migration과 테스트
- 그룹 멤버십 정책 결정 로그

## Findings
- 모든 그룹 RPC는 입력 `groupId`와 현재 활성 멤버십을 함께 검증해야 한다.
- 무료 정원과 멤버십 종료/예약 취소는 잠금 기반 트랜잭션이 필요하다.
- 예약 피드와 공개 피드를 분리하지 않으면 본문 키 자체가 노출될 위험이 있다.
- 기존 couple 테스트는 회귀 기록으로 남길 수 있지만 그룹 승인 기준으로 사용할 수 없다.

## Risks
- 기존 couple migration 위에 group schema를 추가하면 임시 중복 모델이 생긴다.
- 동시 초대 수락 테스트 없이는 무료 정원 제한이 경쟁 조건에서 깨질 수 있다.
- Realtime과 푸시 수신자를 이벤트 생성 시점에만 계산하면 탈퇴 후 전송될 수 있다.

## Recommendation
신규 group migration과 실패하는 pgTAP 테스트를 먼저 추가한다. couple schema 삭제는 group 세로 슬라이스 검증 후 별도 migration으로 수행한다.

## Handoff
Backend 구현은 groups/memberships/invites와 lifecycle RPC부터 시작한다. 이후 mood와 monologue를 추가한다.

## Implementation Result
- `20260614100000_group_foundation.sql` 추가
- groups, group_memberships, group_invites와 RLS helper/policy 구현
- create/list 기반 RLS, 초대 생성/미리보기/수락, 탈퇴, 강퇴 RPC 구현
- 빈 DB migration 재적용 통과
- Supabase schema lint 오류 없음
- 기존 커플 회귀 10개 + 그룹 foundation 37개, 총 47개 pgTAP assertion 통과

## Confidence
High

## Next Suggested Agent
Backend Engineer implementation
