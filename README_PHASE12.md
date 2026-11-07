# Arm Kերպ Phase 12 — Teams + Countdown + Match Results (Beta)

## New
- Optional Red/Blue teams. Host chooses whether team mode is active; participants select teams.
- Server-managed 3-second pre-round countdown synchronized via SSE.
- Team scoreboards, individual results, winners and MVP after final round.
- Existing solo online room and Phase 11 Ready, Transfer, Chat, Rematch retained.

## Testing with WebStorm
1. Open `armkerp-build` in WebStorm. Run `npm install`, `npm start`.
2. Browse `http://localhost:3000` in separate regular and incognito browser sessions.
3. Create a room and join with 2 more players for team mode (1 host + 2 guessers).
4. Host toggles Team Mode ON. Both guests choose opposing teams, then mark Ready.
5. Host starts game, observe 3-2-1 countdown, then guess words.
6. After final round view team winner and MVP. Rematch clears points.

## Limitations
- Team mode is intended for >=3 players: the host describes and does not guess. At least one guest per team is required.
- Team mode and active rounds live in the Node process: active games / chosen mode reset on restart.
- Team selection and point totals are saved in SQLite (on the machine serving the game).
- Not yet voice chat or host rotation; MVP is highest individual point total including ties resolved by sort order.
- This beta still needs live browser testing on multiple devices.
