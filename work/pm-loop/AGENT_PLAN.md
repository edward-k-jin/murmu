# Agent Plan

## Stage
Planning and contract definition

## Agents To Use
- `ux-designer`
- `tech-architect`
- `ui-designer`
- `backend-engineer`
- `frontend-engineer`
- `copywriter`
- `ui-detail-reviewer`
- `qa-engineer`
- `security-reviewer`
- `accessibility-reviewer`
- `devops-release-engineer`

## Parallelizable Work
- UX Designer -> `work/pm-loop/deliverables/UX_FLOW.md`
- Tech Architect -> `work/pm-loop/deliverables/TECH_SPEC.md`
- UX 결정 이후 UI Designer -> `work/pm-loop/deliverables/UI_SPEC.md`
- 아키텍처 결정 이후 Backend Engineer -> `docs/api-interface.md`, `supabase/**`
- 구현 완료 이후 Security와 Accessibility는 독립 보고서로 병렬 검토

## Sequential Dependencies
1. PROJECT_BRIEF 확정
2. UX_FLOW와 TECH_SPEC 작성
3. PM 통합 결정
4. UI_SPEC와 API 계약 작성
5. Frontend 구현
6. UI Detail Review
7. QA/Security/Accessibility 검증과 결함 수정 루프
8. Release 검토

## Handoff Rules
- 다음 역할에는 `PROJECT_BRIEF.md`, 관련 PM 결정 로그, 직접 필요한 deliverable만 제공한다.
- 모든 역할은 `work/pm-loop/reports/`에 표준 형식 보고서를 남긴다.
- 같은 파일을 병렬 역할이 수정하지 않는다.
- 보고서의 추정과 미결정 사항을 확정 사실처럼 구현하지 않는다.
- Critical/High 결함은 수정 후 담당 검토자가 재검증한다.
