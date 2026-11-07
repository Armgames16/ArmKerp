# Arm Կերպ — Phase 10: Live Multiplayer (beta)

## Features
- Reuses Phase 9 authenticated online accounts and 8-character rooms.
- Live updates via authenticated HTTP server-sent event streams (fetch streaming).
- The creator/host starts synchronized 60-second rounds for 2–15 room members.
- The host sees the server-selected secret Armenian word, explains it verbally, and can skip up to three words per round.
- Other members type guesses. The server validates exact answers, gives +1 point to the first correct guess, and chooses the next word.
- Live cumulative scores persist in SQLite, separately from Phase 9's unverified user-submitted scores.
- The server controls word selection, correct-answer checking, scoring and round deadline.

## Start locally
1. Install Node.js and run `npm install` in the project folder.
2. Start with `npm start` (serves on port 3000).
3. Open `http://localhost:3000` on the host computer. For phones on the same Wi-Fi use `http://HOST_LAN_IP:3000`, assuming firewall allows access.
4. Two or more people open the app, sign in under **Online մրցումներ**, join the same room, then use **Live Multiplayer** below that section.
5. The room creator is the describer. Everyone else listens to the describer (in person or on a separate voice call) and submits guesses.
6. To play across the internet, deploy the Node.js app on an HTTPS host. GitHub Pages alone cannot host this backend. Configure the backend URL in the Online section if the frontend is hosted elsewhere.

## Limitations and security
- Beta mode: the describer is always the room creator; no host rotation, voice transmission, invitations, presence indicators or reconnect history.
- Active rounds are stored in server memory. A server restart ends running rounds; persistent live points remain in SQLite.
- Scoring is verified against a server-held answer but cannot prevent host/player collusion or a describer revealing the word.
- For public hosting, enforce HTTPS, secure deployment settings, backups and production-grade rate limits.
- Existing local and asynchronous game modes are preserved; live mode is a separate mini-game.

## Validation
- All JS files pass `node --check` syntax validation and the ZIP integrity check.
- Full runtime integration testing with multiple clients has NOT been completed in this environment (npm dependencies unavailable during preparation).
