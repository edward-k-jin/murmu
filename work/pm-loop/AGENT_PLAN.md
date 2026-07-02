# Agent Plan

## Stage
Group pivot UX and architecture redefinition

## Agents To Use Now
- `ux-designer`
- `tech-architect`

## Parallelizable Work
- UX Designer -> 다중 그룹 선택, 생성, 참여, 관리, 혼잣말 피드 흐름
- Tech Architect -> groups, memberships, roles, invitations, RLS, 기록 가시성 계약

## Sequential Dependencies
1. 그룹 Product Brief 승인
2. 멤버 변동 시 기록 접근 정책 결정 완료
3. UX Flow와 Tech Spec 재작성
4. PM Gate 2/3 통합 결정
5. UI Spec과 API 계약 재작성
6. Backend migration과 Frontend 구현
7. QA/Security/Accessibility 검증

## Superseded Artifacts
- 기존 커플 기반 `UX_FLOW.md`
- 기존 커플 기반 `TECH_SPEC.md`
- 기존 커플 기반 `UI_SPEC.md`
- 기존 `docs/api-interface.md`
- 기존 couple/pairing migration은 새 그룹 migration 전략 확정 전 확장 금지

## Handoff Rules
- 새 역할은 `PROJECT_BRIEF.md`와 `0006-group-policy-baseline.md`를 기준으로 한다.
- 커플 기반 산출물은 참고만 하고 승인된 계약으로 사용하지 않는다.
- 모든 권한 시나리오는 사용자, 그룹, 멤버십 역할, 가입/탈퇴 시각을 포함한다.
- RLS는 현재 활성 멤버십을 기준으로 전체 그룹 기록 접근을 허용하고, 멤버십 종료 즉시 모든 접근을 차단한다.
