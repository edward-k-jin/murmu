# PM Decision Log

## Stage
Group UX and architecture contract

## Inputs Reviewed
- `deliverables/UX_FLOW.md`
- `deliverables/TECH_SPEC.md`
- UX Designer group report
- Tech Architect group report
- 결정 로그 `0006`~`0008`

## Decision
Proceed

## Reason
다중 그룹 탐색, 그룹 식별, 과거 기록 접근, 탈퇴/강퇴 결과와 이를 강제할 데이터 모델/RLS/RPC 경계가 일치한다. UI와 Backend 상세 계약을 다시 작성할 수 있는 수준이다.

## Next Agents
- UI Designer
- Backend Engineer

## Handoff Brief
UI는 현재 그룹을 모든 핵심 화면에서 식별하고 잘못된 그룹 게시를 막아야 한다. Backend는 신규 group 스키마와 실패하는 RLS 테스트부터 작성하며 기존 couple 스키마는 대체 검증 전 유지한다. 멤버십 종료와 미공개 예약 취소는 원자적으로 처리한다.

## Open Questions
- 관리자 혼자 남은 그룹 종료 시 데이터 보존 기간
- 앱 이름과 번들 식별자
- 유료 그룹 최대 정원과 가격
