# Role Report

## Role
Backend Engineer

## Task
P0 Supabase API, RLS, 인덱스, 검증 계약을 정의한다.

## Inputs Used
- `deliverables/TECH_SPEC.md`
- `deliverables/UX_FLOW.md`
- Supabase Postgres RLS, partial index, foreign key index, locking best practices

## Findings
- 앱이 직접 테이블을 조합하기보다 mutation RPC와 목적별 읽기 모델을 사용해야 권한 경계가 명확하다.
- RLS의 membership lookup 컬럼과 모든 외래키는 명시적 인덱스가 필요하다.
- 초대 수락은 짧은 트랜잭션과 일관된 잠금 순서가 필요하다.

## Risks
- 현재 로컬에 Supabase CLI가 없어 마이그레이션과 RLS 테스트를 검증할 수 없다.
- 자정 정책 확정 전 conversation write RPC의 최종 규칙을 고정하면 재작업이 발생한다.

## Recommendation
API 계약을 먼저 승인하고 다음 세로 슬라이스에서 Supabase CLI, 로컬 DB, 실패하는 RLS 테스트와 함께 Auth/Profile/Pairing 스키마를 구현한다.

## Handoff
Frontend Engineer는 API 타입과 mock adapter로 Auth/Profile/Pairing 화면을 구성할 수 있다. Backend 구현 전 production Supabase 연결을 가정하지 않는다.

## Confidence
High

## Next Suggested Agent
Frontend Engineer and Backend Engineer implementation slice

