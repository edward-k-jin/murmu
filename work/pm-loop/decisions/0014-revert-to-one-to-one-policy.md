# PM Decision Log

## Stage
Product policy reset from max-5 group to 1:1 relationship space

## Inputs Reviewed
- User request on 2026-06-28 to revert from couple/friend max-5 group policy to 1:1 basis
- Current group foundation migration and RLS tests
- Current frontend group creation, invite, feed, mood, monologue and thread screens
- Root PRD and Project Brief

## Decision
Revise

## Reason
The approved product direction is no longer a max-5 friend group. P0 must treat each relationship container as a 1:1 space with exactly two active members at most. The existing `group_*` implementation can be temporarily reused as the container layer, but server policy must enforce `member_limit = 2` and user-facing language must stop promising group/friend/5-person behavior.

## Next Agents
- Tech Architect for naming and migration strategy
- UX/UI for final 1:1 language pass
- Backend/Frontend for verification and any missed group assumptions

## Handoff Brief
Do not add 3+ member behavior, group subscription, or paid member expansion. Keep the current schema names only as an implementation bridge. New acceptance criteria: the third active member is rejected, scheduled body remains author-only before publication, and all space data remains isolated by the active membership container.

## Open Questions
- App name and bundle identifier
- Whether P0 targets romantic couples first or broader trusted 1:1 relationships
- Whether the creator can remove the other participant in P0
