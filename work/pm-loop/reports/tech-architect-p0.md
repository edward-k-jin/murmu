# Role Report

## Role
Tech Architect

## Task
React Native와 Supabase 기반 P0 데이터, API, RLS 경계와 구현 순서를 정의한다.

## Inputs Used
- `work/pm-loop/PROJECT_BRIEF.md`
- `docs/PRD.md`
- `docs/ADR/0001-react-native-expo.md`
- 기존 Expo 앱 구조

## Findings
- 혼잣말 본문은 단일 테이블 직접 조회보다 작성자용/상대 목록용/공개 상세용 읽기 계약을 분리해야 한다.
- 한 사용자 한 커플과 초대 수락은 RLS만으로 부족하며 트랜잭션 RPC와 유니크 인덱스가 필요하다.
- 앱 종료는 서버가 신뢰성 있게 알 수 없으므로 활동 세션과 날짜 기록을 분리해야 한다.

## Risks
- PRD의 자정 이후 시작일 유지와 지난 날짜 쓰기 금지는 상충한다.
- Realtime 또는 알림 페이로드가 RLS 외부에서 본문을 유출할 수 있다.
- 연결 해제 정책 미정 상태에서 데이터 삭제를 구현하면 복구 불가능한 결정을 하게 된다.

## Recommendation
서버 전송 시점 날짜를 쓰기 기준으로 삼고 자정 이후 새 날짜 기록으로 전환한다. 본문 없는 상대 목록 뷰와 공개 상세 RPC를 분리한다. 연결 해제는 후속 정책 전까지 접근 차단만 설계한다.

## Handoff
Backend Engineer는 스키마보다 RLS 부정 테스트를 먼저 만들고 초대, 혼잣말 공개, 날짜별 메시지 RPC를 순서대로 구현한다.

## Confidence
High

## Next Suggested Agent
Backend Engineer and Security Reviewer

