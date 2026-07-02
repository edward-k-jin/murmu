# Role Report

## Role
UI Designer

## Task
다중 그룹 UX와 디자인 시스템을 P0 화면 및 컴포넌트 상세 명세로 변환한다.

## Inputs Used
- `deliverables/UX_FLOW.md`
- `DESIGN.md`
- `PROJECT_BRIEF.md`
- 결정 로그 `0008`, `0009`

## Findings
- 현재 그룹 식별은 제목 장식이 아니라 프라이버시 안전장치다.
- 잠긴 혼잣말은 본문 영역 자체가 없어야 길이나 형태를 추론할 수 없다.
- 그룹 전환은 이전 콘텐츠를 유지한 채 이름만 바꾸면 안 되고 중립 로딩으로 교체해야 한다.

## Risks
- 긴 그룹명이 작성 대상과 화면 제목의 위계를 무너뜨릴 수 있다.
- 강퇴/탈퇴 결과 설명이 길면 사용자가 중요한 접근 상실을 놓칠 수 있다.
- 탈퇴 작성자의 상태가 과도하게 강조되면 기록보다 관계 변화가 중심이 된다.

## Recommendation
GroupSwitcher를 전역 핵심 컴포넌트로 두고 작성 화면과 제출 확인에 그룹명을 반복한다. 탈퇴 작성자는 중립 보조 상태로만 표시한다.

## Handoff
Frontend는 Auth → Group Start → Create/Join → GroupSwitcher 세로 슬라이스를 먼저 구현한다. 모든 그룹 화면은 명시적 `groupId` 없이는 데이터를 렌더링하지 않는다.

## Confidence
High

## Next Suggested Agent
Frontend Engineer after backend group foundation
