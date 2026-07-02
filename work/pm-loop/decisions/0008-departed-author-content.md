# PM Decision Log

## Stage
Departed author content handling

## Inputs Reviewed
- 사용자 승인
- `PROJECT_BRIEF.md`
- `0007-membership-history-access.md`

## Decision
Proceed

## Reason
공개된 대화 맥락은 보존하면서 멤버십이 종료된 작성자의 비공개 감정이 사후 공개되는 위험을 차단한다.

## Next Agents
- UX Designer
- Tech Architect

## Handoff Brief
- 탈퇴·강퇴 전에 공개된 혼잣말과 스레드는 작성자 표시와 함께 유지한다.
- 미공개 예약 혼잣말은 작성자의 탈퇴·강퇴 트랜잭션에서 자동 취소한다.
- 취소된 혼잣말은 다른 그룹원에게 본문이나 메타데이터를 노출하지 않는다.
- 탈퇴·강퇴된 작성자는 보존된 자신의 공개 기록도 더 이상 열람할 수 없다.

## Open Questions
- 관리자 혼자 남은 그룹 종료 시 데이터 보존 기간
