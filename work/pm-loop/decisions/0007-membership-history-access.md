# PM Decision Log

## Stage
Membership lifecycle and history access

## Inputs Reviewed
- 사용자 제품 결정
- `PROJECT_BRIEF.md`
- `0006-group-policy-baseline.md`

## Decision
Proceed

## Reason
관리자 탈퇴 제한과 멤버십 전후 기록 접근 규칙이 결정되어 다중 그룹 UX와 RLS를 일관되게 설계할 수 있다.

## Next Agents
- UX Designer
- Tech Architect

## Handoff Brief
- 그룹 생성자는 영구 관리자다.
- 관리자는 자신 외 활성 멤버가 있으면 탈퇴할 수 없다.
- 일반 멤버는 자진 탈퇴할 수 있고 관리자는 일반 멤버를 강퇴할 수 있다.
- 현재 활성 멤버는 가입 시점과 무관하게 그룹의 과거 기록을 볼 수 있다.
- 탈퇴 또는 강퇴된 사용자는 과거 기록을 포함한 해당 그룹 전체 접근 권한을 즉시 잃는다.
- 예약 공개 전 본문은 신규 멤버에게도 기존 멤버와 동일하게 숨긴다.

## Open Questions
- 탈퇴·강퇴한 작성자의 기존 콘텐츠를 유지, 익명화, 삭제 중 어떻게 처리할지
- 예약 공개 전에 작성자의 멤버십이 종료된 경우 예정대로 공개할지
