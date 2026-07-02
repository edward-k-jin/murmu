# PM Decision Log

## Stage
Group product pivot and Gate 0/1 reset

## Inputs Reviewed
- `couple-app-prd.md` v2 diff
- Product Strategist group pivot review
- 기존 Project Brief, UX Flow, Tech Spec, API 계약
- 현재 Auth/Profile/Pairing 구현 상태

## Decision
Ask User

## Reason
제품 단위가 2인 커플에서 최대 5인 폐쇄 그룹으로 변경되어 기존 UX, 데이터 모델, RLS, 초대 계약이 더 이상 승인된 구현 기준이 아니다. 그룹 권한과 기록 가시성은 임의로 정하면 데이터 노출과 관계 분쟁 위험이 있어 사용자 제품 결정이 필요하다.

## Next Agents
- PM Orchestrator
- 결정 후 UX Designer
- 결정 후 Tech Architect

## Handoff Brief
기존 Gate 3 승인은 superseded로 간주하고 Gate 4 기능 구현을 중지한다. Auth/Profile 기반 중 재사용 가능한 부분만 유지하며 couple/pairing 계약은 새 group/membership 계약 승인 전 확장하지 않는다.

## Open Questions
- 첫 사용자 집단을 어떤 친구 그룹으로 좁힐지
- 그룹 생성자에게 어떤 관리 권한을 줄지
- 그룹 정원을 영구 5명으로 둘지 유료 확장을 허용할지
- 탈퇴/강퇴/신규 가입 시 과거 혼잣말과 스레드 접근 범위
- 한국어 단독 MVP 후 일본어를 추가할지
