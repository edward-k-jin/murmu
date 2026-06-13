# ADR 0001: React Native with Expo Development Builds

## Status
Accepted on 2026-06-13.

## Context
커플 두 명의 OS가 다를 수 있어 iOS와 Android 동시 지원이 필수다. 앱은 실시간 텍스트, 푸시 알림, 소셜 로그인, 딥링크를 사용하며 앱스토어에 네이티브 앱으로 배포해야 한다.

## Decision
- React Native와 TypeScript를 사용한다.
- Expo SDK 56 기본 템플릿과 Expo Router를 사용한다.
- Expo Go를 제품 개발 환경으로 사용하지 않고 Development Build를 사용한다.
- 네이티브 변경이 필요하면 config plugin 또는 `ios/`, `android/` 네이티브 프로젝트를 생성해 확장한다.
- Supabase를 초기 백엔드로 사용한다.

## Why
- React Native는 플랫폼 네이티브 컴포넌트를 사용하며 iOS/Android를 한 코드베이스에서 개발할 수 있다.
- Development Build는 원격 푸시, 앱 링크, 사용자 정의 네이티브 라이브러리를 제품과 같은 조건으로 검증할 수 있다.
- 이 제품은 이미지 처리나 고사양 그래픽보다 텍스트와 실시간 데이터가 중심이라 React Native가 성능 요구에 적합하다.

## Consequences
- 리스트와 채팅 렌더링은 메모이제이션보다 먼저 데이터 페이지네이션과 가상화를 설계한다.
- JS 스레드에서 무거운 감정 분석을 실행하지 않고 서버 배치 작업으로 처리한다.
- Expo SDK와 React Native 버전은 임의로 따로 올리지 않고 Expo 호환표를 따른다.

