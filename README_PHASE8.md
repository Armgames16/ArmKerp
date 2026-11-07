# ARM KERP Phase 8 — Social Score Challenges

## What's new
- Share the best team score from a finished game using native sharing, clipboard, or a copyable code.
- Friends can paste a score code (or a hosted URL with `#challenge=`) into the setup or winner screen.
- Compare your most recently completed game's top score with a friend's top score.
- No accounts, external servers, or libraries are required for challenge comparison.
- Armenian UI, mobile touch targets, validation, and accessible labels.

## Important limitations
This is **asynchronous score sharing**, not real-time online multiplayer or a public server leaderboard. Shared results are **self-reported and can be edited**. Treat them as friendly comparisons, not competitive anti-cheat proof. The last score is kept in this browser's localStorage. If you open the game on another device you must share the code to compare. Existing Phase 1–7 features remain in place.

## Run
- Open index.html for local play. The shareable URL option is enabled when hosted on HTTPS (e.g. GitHub Pages).
- For the existing Node backend: run `npm install` then `npm start` from this folder.

## Testing
- JS syntax checks: `node --check script.js` and `node --check phase8.js`.
- For functional check: complete a game, share the challenge code, paste it into setup, compare scores. Confirm both phones work on deployed HTTPS.
