# Phase 17 — Friends & Invitations (Beta)

Features: authenticated friend requests and acceptance, friends list, remove friend, host-to-friend room invitations, accept/decline invitation to join a room (including private rooms). Existing online accounts and room security remain in use. Friend invitations are server stored and checked for room-owner permissions, active friendship, room bans, and capacity at acceptance.

WebStorm: open `armkerp-build`, run `npm install` and `npm start`, browse `http://localhost:3000`. Use two browser profiles with distinct online accounts. Both need the same running backend. SQLite database is located at `database.db` relative to server working directory; back it up before migration.

First test: Account A sends friend request to B by exact username, B accepts it, A creates a room and presses Invite next to B, B accepts the invitation, then room membership appears in Live Multiplayer. Invitations can bypass private-room invite/password requirements only when explicitly issued by that room's creator to an accepted friend. This does not override ban or capacity.

Limitations: no push notifications; the friends panel polls every 10 seconds and supports manual refresh. Friends are stored in the same backend database; not synchronized across separate servers. This is beta: test in two browsers and review security before public deployment.
