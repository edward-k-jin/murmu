# Project State

## Summary
Murmu는 사진 없이 텍스트로 감정을 주고받는 iOS/Android 커플 앱이다.

## Current Architecture
- React Native
- Expo SDK 56 Development Build
- TypeScript
- Expo Router
- Supabase

## Current Design
- Airbnb-inspired warm light visual tokens
- Linear-inspired restrained interaction
- Mobile-native layouts and platform behavior

## Validation
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npx expo-doctor`: 21/21 passed

## Next Action
Supabase 환경값과 Apple/Google OAuth를 설정한 뒤 3단계 Welcome 온보딩부터 1:1 공간 생성·초대·혼잣말까지 기기에서 재검증한다.
