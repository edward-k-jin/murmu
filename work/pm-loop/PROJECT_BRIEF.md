# Project Brief

## User Goal
사진 없이 텍스트로 서로의 감정을 안전하게 주고받는 iOS/Android 커플 앱을 출시한다.

## Target User
서로 다른 모바일 OS를 사용할 수 있는 연애 커플. 특히 즉시 말하기 어려운 감정을 쌓아두지 않고 상대와 천천히 나누고 싶은 사용자.

## Problem
기존 커플 앱은 채팅, 사진, 일정 기록에 집중한다. 사용자는 서운함이나 복잡한 감정을 바로 말하기 어렵고, 상대는 감정 상태를 알 방법이 부족하다.

## MVP Scope
- 소셜 로그인과 닉네임 온보딩
- 초대 코드/링크를 통한 1인 1커플 연결
- 오늘의 기분 체크인
- 일자별 커플 텍스트 채팅과 기분 태그
- 혼잣말 작성, 기분 공개, 본문 잠금
- 열람 요청, 작성자의 수락/미루기
- 단기 시간차 자동 공개
- 공개된 혼잣말 스레드 대화
- 새 메시지, 혼잣말 등록, 열람 요청 푸시 알림

## Non-Goals
- 사진, 동영상, 음성 공유
- 범용 메신저 대체
- 실시간 AI 대화
- 웹/PWA 우선 출시
- macOS, 위젯, 타임캡슐, 포인트의 MVP 포함

## Success Criteria
- 커플이 하루 1회 이상 상대 기분을 확인할 수 있다.
- 비공개 혼잣말 본문은 공개 조건 전 상대 API 응답과 접근성 라벨에 포함되지 않는다.
- 같은 날 채팅은 이어 쓰고 지난 날짜는 읽기 전용으로 동작한다.
- iOS/Android Development Build에서 로그인, 딥링크, 푸시 흐름을 검증한다.
- lint, typecheck, unit test, native build가 통과한다.

## Constraints
- React Native 0.85 + Expo SDK 56 + TypeScript
- Expo Go가 아닌 Development Build 사용
- Supabase Auth, Postgres, Realtime, RLS 우선
- 서버 시간을 저장 기준으로 사용하고 사용자 시간대로 표시
- 텍스트 외 사용자 콘텐츠 이미지는 지원하지 않음
- 개인정보 최소 수집과 작성자 공개 통제권 우선

## Design Direction
Airbnb에서 따뜻한 라이트 톤, 타이포 위계, 넉넉한 여백, 부드러운 곡률을 차용한다. Linear에서는 절제된 모션, 희소한 강조색, 얇은 경계와 즉각적인 상태 피드백을 차용한다. 웹/마케팅 레이아웃은 복제하지 않고 모바일 네이티브 IA로 재구성한다. 프로젝트 기준은 루트 `DESIGN.md`다.

## Open Questions
- 앱 이름 `Murmu`와 번들 식별자를 최종 확정할지
- 혼잣말 미루기 넛지의 임계값과 빈도
- 커플 연결 해제 시 데이터, 구독, 히스토리 귀속 정책
- 초기 타겟을 20~30대 연애 커플로 좁힐지

## Agent Plan
1. UX Designer: P0 사용자 흐름, 화면 목록, 상태 모델
2. Tech Architect: 데이터/API/RLS 경계와 구현 순서
3. PM: 두 보고서 통합 결정
4. UI Designer + Backend Engineer: 디자인 명세와 Supabase 계약
5. Frontend Engineer: 세로 슬라이스 구현
6. Copywriter + UI Detail Reviewer
7. QA + Security + Accessibility Reviewer
8. DevOps Release Engineer
