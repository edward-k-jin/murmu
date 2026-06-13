# Murmu Progress

## Current
- 상태: 프로젝트 초기화 완료, UX/API 계약 단계 대기
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
- [ ] P0 사용자 흐름과 수용 기준 구체화

## Next
- [ ] 디자인 토큰과 핵심 화면 UX 명세
- [ ] Supabase 데이터 모델, RLS, API 계약
- [ ] 인증/온보딩 세로 슬라이스 구현
- [ ] 커플 연결 세로 슬라이스 구현
- [ ] 혼잣말 핵심 루프 구현
- [ ] 일자별 채팅 세션 구현
- [ ] 푸시 알림과 딥링크 구현
- [ ] QA, 보안, 개인정보 검토

## Open Decisions
- 앱 이름과 번들 식별자
- 혼잣말 미루기 넛지 임계값
- 커플 연결 해제 시 데이터 귀속 정책

## Known Risks
- `npm audit` moderate 11건은 Expo CLI의 `xcode -> uuid` 도구 체인 경로다.
- `npm audit fix --force`는 Expo SDK 의존성을 하향하는 breaking change라 적용하지 않았다.
