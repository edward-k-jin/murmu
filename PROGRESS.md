# Murmu Progress

## Current
- 상태: 최대 5인 그룹 피벗을 중단하고 1:1 관계 기반으로 정책 원복
- 기술: React Native + Expo Development Build + TypeScript + Supabase
- 디자인: Airbnb 톤 + Linear 인터랙션, 모바일 네이티브 재구성

## Completed
- [x] 원본 PRD 검토
- [x] 플랫폼과 기술 방향 확정
- [x] 프로젝트 에이전트 운영 규칙 작성
- [x] 초기 디자인 방향 작성
- [x] 초기 ADR 작성

## In Progress
- [x] Expo SDK 56 프로젝트 초기화
- [x] Development Build와 앱 Provider 구조 설정
- [x] 디자인 토큰 기반 첫 화면 구현
- [x] lint, TypeScript, Expo Doctor 검증
- [x] codex-agent-workflows PM Loop 적용
- [x] 프로젝트 브리프, 에이전트 계획, 결정 로그 생성
- [x] UX Flow와 화면 상태 모델 작성
- [x] 기술 명세와 Supabase 권한 경계 작성
- [x] UX/아키텍처 PM 통합 결정
- [x] P0 모바일 UI 명세 작성
- [x] Supabase API/RLS 계약 작성
- [x] UI/백엔드 PM 통합 결정
- [x] Supabase 로컬 프로젝트 초기화
- [x] Auth/Profile/Pairing 초기 마이그레이션 작성
- [x] Docker Desktop과 Supabase 로컬 스택 구성
- [x] 빈 DB 마이그레이션 재적용 및 schema lint
- [x] Auth/Profile/Pairing RLS 통합 테스트 10개 통과
- [x] 서울 리전 Supabase 클라우드 프로젝트 생성 및 초기 migration 적용
- [x] P0 사용자 흐름과 수용 기준 구체화

## Next
- [x] 다중 그룹 UX 흐름과 수용 기준 재작성
- [x] groups/memberships 데이터 모델과 RLS 아키텍처 재작성
- [x] 그룹 API 상세 계약과 RLS 검증 시나리오 작성
- [x] group foundation migration과 pgTAP 테스트 구현
- [x] Frontend 그룹 생성·초대·참여·전환 세로 슬라이스 구현
- [x] 최대 5인 그룹 정책을 1:1 공간 정책으로 원복
- [ ] Supabase 환경값과 Apple/Google OAuth 설정
- [x] 그룹별 기분 체크인과 혼잣말 예약/공개 구현
- [x] 3단계 Welcome 온보딩과 Apple/Google 로그인 문구 조정
- [ ] 1:1 공간 생성·초대·참여 세로 슬라이스 재검증
- [x] 혼잣말 핵심 루프 구현
- [x] 공개 혼잣말 종속 스레드 구현
- [ ] 푸시 알림과 딥링크 구현
- [ ] QA, 보안, 개인정보 검토

## Open Decisions
- 앱 이름과 번들 식별자
- 1:1 관계 유형을 연인 중심으로 좁힐지, 친한 친구/가족까지 열어둘지
- 공간을 만든 사람이 상대를 제거할 수 있는 권한을 P0에 유지할지

## Known Risks
- `npm audit` moderate 11건은 Expo CLI의 `xcode -> uuid` 도구 체인 경로다.
- `npm audit fix --force`는 Expo SDK 의존성을 하향하는 breaking change라 적용하지 않았다.
- Docker/Supabase 로컬 검증 병목은 해소됐다. 외부 다운로드가 필요한 Supabase CLI 재설치는 보안 정책상 실행하지 않고 기존 로컬 DB 컨테이너에서 SQL을 검증했다.
- 실제 OAuth 로그인과 두 사용자 기기 E2E는 Supabase 환경값 및 공급자 설정 전까지 검증할 수 없다.
