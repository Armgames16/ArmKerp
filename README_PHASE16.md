# Phase 16 — Secure Multiplayer Rooms (Beta)

Run: `npm install` then `npm start` in `armkerp-build`.

New: private rooms with random 48-character invite tokens; optional bcrypt-hashed room passwords; host-only security settings and invite rotation; kick/ban with unban. Kicked users have existing live streams closed and cannot rejoin before unbanning. Kick is disabled during active and countdown rounds. Existing Phase 15 voice chat and team mode are preserved.

Note: room invite token is shown to creator on creation and stored in browser session; to regenerate it, use the security settings in the lobby. Existing room members do not need to re-enter password when rejoining. A password can be cleared using checkbox. Changing room privacy and rotating invitation invalidates earlier invitations for new joins.

Security limitations: still beta; sessions last 14 days, accounts have no email verification, CORS is currently permissive, and the app should be served over HTTPS with proper rate limiting and managed hosting before public release. Live and voice state is single-process. Test 2 browsers and protect your DB file.
