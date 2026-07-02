# Agent Work Plan

## Gate 0: Foundation
- [x] PRD 해석
- [x] React Native + Expo Development Build 결정
- [x] 디자인 방향 결정
- [x] 역할별 파일 소유권 선언
- [x] Expo 프로젝트 생성
- [x] lint, typecheck, Expo Doctor 기본 검증

## Parallel Track A: Product And Design
Owner: Planner + Designer

Files:
- `docs/UX_FLOW.md`
- `docs/design-tokens.md`
- `DESIGN.md`

Deliverables:
- P0 화면 흐름과 상태
- 온보딩, 대화, 혼잣말의 빈값/오류/잠금 상태
- 모바일 토큰과 인터랙션 명세

## Parallel Track B: Backend Contract
Owner: Backend

Files:
- `docs/api-interface.md`
- `supabase/**`

Deliverables:
- 사용자/커플/초대/기분/혼잣말/채팅 스키마
- RLS 정책과 서버 시간 규칙
- Realtime 채널과 푸시 이벤트 계약

## Sequential Track C: App
Owner: App

Dependency:
- Track A와 B 문서를 먼저 읽는다.

Files:
- `app/**`

Deliverables:
- 인증과 온보딩부터 세로 슬라이스 단위로 구현
- 플랫폼별 네이티브 동작 검증

## Risks
- 비공개 혼잣말 유출: 본문 쿼리 자체를 RLS와 별도 공개 뷰로 차단
- 세션 날짜 불일치: 서버 기준 세션 시작일과 사용자 타임존을 함께 저장
- 푸시 프라이버시: 잠금 화면 알림에 혼잣말 본문을 포함하지 않음
- 푸시 payload: `groupId`, `eventType`, 라우팅용 opaque ID만 포함하고 본문/미리보기/글자 수는 제외
- 알림 설정: 전체 푸시, 공개 혼잣말, 예약 공개, 스레드 답장, 공간 변경, 기분 리마인더 선호값 저장
- 웹 디자인 모방: 토큰만 차용하고 화면 구조는 모바일 UX 문서에서 결정
- Expo Go 제약: 초기부터 Development Build로 검증
