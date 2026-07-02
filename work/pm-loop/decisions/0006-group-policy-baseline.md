# PM Decision Log

## Stage
Group product policy baseline

## Inputs Reviewed
- 사용자 제품 결정
- `couple-app-prd.md` v2
- Product Strategist group pivot review

## Decision
Proceed

## Reason
초기 타겟, 다중 그룹 허용, 관리자 권한, 무료 정원이 결정되어 새 UX와 권한 모델 설계를 시작할 수 있다. 다만 멤버 변동에 따른 과거 기록 접근은 구현 전 추가 결정이 필요하다.

## Next Agents
- UX Designer
- Tech Architect

## Handoff Brief
첫 타겟은 오래된 친구 모임과 직장인 절친 등 이미 신뢰가 형성된 그룹이다. 한 사용자는 여러 그룹에 참여할 수 있다. 그룹 생성자는 관리자이며 초대와 강퇴 권한을 가진다. 무료 그룹은 최대 5명이고 유료 그룹은 6명 이상을 허용하되 유료 상한은 P1에서 정한다. 모든 데이터와 알림은 그룹별로 격리한다.

## Open Questions
- 관리자 탈퇴 시 승계 방식
- 탈퇴/강퇴 멤버의 과거 기록 접근
- 신규 멤버의 가입 전 기록 접근
- 예약 공개 작성자의 멤버십 종료 처리
