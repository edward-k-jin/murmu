# Role Report

## Role
UX Designer

## Task
다중 폐쇄 그룹의 생성, 전환, 혼잣말, 멤버 관리와 기록 접근 흐름을 재설계한다.

## Inputs Used
- `PROJECT_BRIEF.md`
- 결정 로그 `0006`~`0008`
- `DESIGN.md`

## Findings
- 다중 그룹에서 가장 큰 사용자 실수는 잘못된 그룹에 혼잣말을 게시하는 것이다.
- 신규 멤버의 과거 기록 열람은 초대자와 참여자 모두에게 사전 고지가 필요하다.
- 탈퇴와 강퇴에는 접근 상실, 공개 기록 유지, 예약 취소 결과를 설명하는 확인 흐름이 필요하다.

## Risks
- 그룹 전환 중 이전 그룹 콘텐츠가 보이면 프라이버시 사고로 인식된다.
- 관리자 강퇴가 감정적 보복 도구가 될 수 있다.
- 탈퇴한 작성자의 이름 보존은 개인정보 삭제 요청 정책과 충돌할 수 있다.

## Recommendation
현재 그룹을 전역 컨텍스트로 명확히 표시하고 작성 확인에 그룹명을 반복한다. 그룹별 캐시와 초안을 분리하고 멤버십 종료 시 즉시 화면과 캐시를 폐기한다.

## Handoff
UI Designer는 그룹 전환기와 권한 확인 시트를 설계한다. Frontend는 모든 키와 딥링크에 `groupId`를 포함한다.

## Confidence
High

## Next Suggested Agent
PM Orchestrator and UI Designer
