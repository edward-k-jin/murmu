# Supabase Tests

기존 `auth_pairing_rls.sql`은 초기 1:1 검증 기록이다. 현재 P0 승인 기준은 group-prefixed 구현을 1:1 공간 정책으로 제한한 테스트다.

1:1 공간 P0 테스트 순서:

1. [x] 관리자/멤버/제3자 RLS 매트릭스
2. [x] 다중 그룹 간 조회 격리
3. [x] 1:1 공간 활성 인원 2명 초과 금지
4. [x] 관리자 초대·강퇴 권한과 일반 멤버 거부
5. [x] 다른 멤버가 있는 관리자 탈퇴 거부
6. [x] 탈퇴·강퇴 즉시 그룹 및 멤버십 접근 차단
7. [x] 신규 멤버의 가입 이전 공개 기록 열람
8. [x] 공개된 탈퇴 작성자 기록 보존
9. [x] 멤버십 종료와 미공개 예약 취소 원자성
10. [x] 예약 피드 응답에 본문 없음
11. [x] authenticated 직접 group 테이블 mutation 거부

`group_foundation_rls.sql`은 공간 foundation 34개 assertion을, `mood_monologue_rls.sql`은 기분·혼잣말·스레드 40개 assertion을 검증한다. 현재 P0 합계는 74개다.
