# PM Decision Log

## Stage
UI and backend contract

## Inputs Reviewed
- `deliverables/UI_SPEC.md`
- `docs/api-interface.md`
- UI Designer report
- Backend Engineer contract report

## Decision
Proceed

## Reason
Auth/Profile/Pairing 세로 슬라이스를 구현할 화면 상태와 API 계약이 준비됐다. 백엔드 실제 구현은 Supabase CLI와 RLS 테스트 환경을 함께 구성해야 하므로 다음 슬라이스에 포함한다.

## Next Agents
- Frontend Engineer
- Backend Engineer implementation

## Handoff Brief
첫 구현 범위는 Welcome, Social Login, Profile Setup, Pairing Hub, Invite Confirmation이다. Backend는 profiles/couples/couple_members/couple_invites와 RPC만 구현한다. 다른 P0 테이블은 아직 만들지 않는다.

## Open Questions
- 자정 이후 대화 기록 정책은 채팅 구현 전에 확정
- 앱 이름/번들 식별자는 소셜 로그인 공급자 설정 전에 확정

