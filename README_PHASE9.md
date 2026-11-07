# Arm Kերպ — Phase 9: Online Score Rooms (beta)

## What is included
- **Server-backed, asynchronous** friend rooms (8-character invite codes, up to 15 people).
- Separate online accounts, bcrypt password hashes, random bearer tokens stored hashed in SQLite, 14-day expiry.
- Per-user best score per room; a global Top 30 of each player's best room score.
- Room refresh every 12 seconds when the page is visible; manual refresh available.
- Score submissions are **self-reported and not cheat-proof**. No live shared game timer or synchronized turns.
- Existing local accounts are NOT converted to online accounts (local passwords are stored in plaintext in the original app). Create a new online account with a different password.

## Run locally
1. Install Node.js (compatible with your version of better-sqlite3).
2. Open a terminal in this directory and run `npm install` then `npm start`.
3. Visit `http://localhost:3000`. In Online competitions, create an online account, then create/join a room.
4. To test across devices on the same Wi-Fi, use `http://YOUR_COMPUTER_LAN_IP:3000` and make sure firewall permits the connection.

## Hosting / security
- **GitHub Pages cannot host the Node.js + SQLite backend.** Deploy the backend to a persistent Node host with a persistent writable database volume, then set the API URL in the game's Online section to the backend's HTTPS origin. A browser might block a front-end with HTTPS from accessing an HTTP backend.
- Use HTTPS for online deployments; tokens are stored in the browser session storage and transmitted as Authorization headers. Log out from shared computers.
- Set strict CORS allowed origins before public production deployment. This beta uses the existing permissive CORS middleware and does not include email verification, password resets, account deletion tools, anti-cheat validation or abuse moderation. Do not publish as a production service without hardening these.
- SQLite data file is ignored by Git; do not include it in your public repository. Use backups and persistent storage on the server.
- The old local sign-in system is separate and stores passwords in localStorage; do not reuse those passwords for the online service.

## Routes
`POST /api/online/register`, `POST /api/online/login`, `POST /api/online/logout`, `GET /api/online/me`, `POST /api/online/rooms`, `POST /api/online/rooms/:code/join`, `GET /api/online/rooms/:code`, `POST /api/online/rooms/:code/score`, `GET /api/online/leaderboard`.

Room codes alone do not authorize score submissions: participants must have a valid bearer token and join the room first.
