# PM Decision Log

## Stage
Group UI and backend detail contract

## Inputs Reviewed
- `deliverables/UI_SPEC.md`
- `docs/api-interface.md`
- UI Designer group detail report
- Backend Engineer group contract report
- `supabase/tests/README.md`

## Decision
Proceed

## Reason
다중 그룹의 화면 상태와 서버 권한 계약이 현재 그룹 식별, 가입 전 기록, 탈퇴 접근 차단, 공개 기록 보존, 예약 취소 정책을 동일하게 표현한다. Backend foundation과 첫 Frontend 세로 슬라이스 구현을 시작할 수 있다.

## Next Agents
- Backend Engineer implementation
- Frontend Engineer after group foundation API types are stable

## Handoff Brief
Backend는 group-prefixed 신규 schema와 실패하는 RLS 테스트부터 구현한다. 첫 범위는 profile 재사용, group 생성, 초대, 참여, 목록, 탈퇴, 강퇴다. Frontend는 해당 API 계약이 안정되면 Auth → Group Start → Create/Join → Switcher를 구현한다. 혼잣말과 mood는 다음 세로 슬라이스다.

## Open Questions
- 관리자 혼자 남은 그룹 종료의 보존 기간은 종료 기능 전 결정
- 앱 이름과 번들 식별자는 소셜 로그인 설정 전 확정
