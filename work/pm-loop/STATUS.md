# PM Loop Status

## Current Stage
Gate 1/4 rework in progress: product policy reverted from max-5 group to 1:1 relationship space

## Completed
- PRD 검토와 P0 범위 식별
- React Native + Expo Development Build 기술 결정
- Airbnb + Linear 모바일 디자인 방향 결정
- 프로젝트 초기 구조, 디자인 토큰, 첫 화면 생성
- lint, typecheck, Expo Doctor 검증
- PM Loop 프로젝트 브리프와 에이전트 계획 생성
- UX Designer P0 흐름과 상태 모델
- Tech Architect 데이터/API/RLS 경계
- PM UX/아키텍처 통합 결정
- UI Designer P0 모바일 화면/컴포넌트 명세
- Backend Engineer API/RLS/인덱스 계약
- PM UI/백엔드 계약 결정
- Docker Desktop 및 Supabase 로컬 개발 스택 구성
- Auth/Profile/Pairing 마이그레이션 빈 DB 재적용
- Supabase schema lint 통과
- 기본 RLS 통합 테스트 10개 통과
- 커플 전용에서 최대 5인 폐쇄형 친구 그룹으로 변경된 PRD v2 1차 검토
- 초기 타겟, 다중 그룹, 생성자 관리자, 무료 5명 정책 결정
- 그룹 피벗 Project Brief 갱신
- 관리자 탈퇴 제한과 멤버십 전후 기록 접근 정책 결정
- 탈퇴 작성자의 공개 기록 보존과 미공개 예약 취소 정책 결정
- 다중 그룹 UX Flow 재작성
- groups/memberships/RLS Technical Spec 재작성
- PM 그룹 UX/아키텍처 통합 승인
- 그룹 UI 상세 명세 재작성
- 그룹 API/RLS/인덱스/검증 계약 재작성
- PM 그룹 UI/Backend 상세 계약 승인
- groups/memberships/invites migration 구현
- 그룹 생성·초대·참여·탈퇴·강퇴 RPC와 RLS 구현
- 빈 DB migration 및 schema lint 통과
- 기존 회귀 10개와 그룹 foundation 37개, 총 47개 pgTAP assertion 통과
- Supabase 세션/AuthProvider와 GroupProvider 구현
- Group Start, 생성, 초대, 참여, Group Switcher 구현
- Frontend lint, typecheck, web static export 통과
- 환경 미설정 화면 인앱 브라우저 렌더링 확인
- 그룹별 기분 체크인, 멤버 기분 현황 구현
- 혼잣말 즉시 공개·예약·수정·취소와 잠긴 피드 구현
- 공개 혼잣말 상세와 종속 스레드 구현
- 멤버십 종료 시 예약 혼잣말 원자적 취소 구현
- 예약 본문 author-only RPC와 피드 비노출 경계 구현
- 신규 40개와 기존 37개, 그룹 P0 pgTAP 77개 통과
- Frontend lint, typecheck, 12개 route web static export 통과
- 최대 5인 그룹 피벗 superseded 처리
- 루트 PRD와 Project Brief를 1:1 관계 기반으로 갱신
- 서버 `member_limit` 기본값과 제약을 2명 고정으로 변경
- 그룹 정원 테스트를 세 번째 가입 거부 기준으로 변경
- 핵심 앱 문구를 1:1 공간/상대 기준으로 변경
- 예약 공개 가능 기간을 최대 7일로 결정
- 유료화 기준을 공간 확장과 월간 리포트 중심으로 결정

## In Progress
- 기존 `group_*` 명명과 문서 산출물의 1:1 기준 정리
- OAuth 환경 설정 후 실제 두 사용자 흐름 QA 준비
- 푸시 알림과 Realtime 이벤트 준비

## Blocked
- 없음

## Next
먼저 1:1 정책 기준으로 lint/typecheck와 RLS 테스트를 재검증한다. 이후 OAuth 환경을 설정한 뒤 iOS/Android Development Build에서 로그인부터 1:1 공간·혼잣말·스레드까지 두 계정 E2E를 검증한다.
