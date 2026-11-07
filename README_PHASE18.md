# Phase 18 — Optimization & Bug Fixes (Beta)

Built on Phase 17; keeps all previous game features.

Changes:
- Preserve typed Add Friend username and keyboard focus during automatic refresh.
- Coalesce manual refresh requests while a friends request is in flight.
- Accurately mark live transport offline when session is absent or unauthorized.
- Add `GET /api/health` for non-sensitive server health checking.
- Add `Cache-Control: no-store` to `/api/` responses and minimal browser safety headers.
- Use explicit zero-duration static asset cache policy for easier development.
- Add real local `favicon.svg` to prevent favicon 404.
- Add built-in Node.js smoke checks (`npm test`).

WebStorm: Open `armkerp-build`, run `npm install`, `npm test`, then `npm start`. Check `http://localhost:3000/api/health`.

IMPORTANT: If upgrading from an earlier folder, back up and migrate the SQLite database (typically `database.db`) before changing servers. Do not replace an existing DB with an empty one.

Tests validate syntax and asset linkage, not the full multiplayer or security behavior. Real browser, two-account, network-loss, and mobile tests still required before release.
