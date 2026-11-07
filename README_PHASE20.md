# ARM ԿԵՐՊ 1.0 — Phase 20 Release Candidate

## What's new
- Cleaner home screen with four clearly labeled sections: **Խաղ**, **Online**, **Ընկերներ**, **Պարգևներ**.
- Separate multiplayer and friends flows, inline instructions, consistent component spacing, responsive mobile navigation.
- Keyboard-accessible tabs with Arrow Left/Right, Home and End keys, focus indicators; respects reduced-motion settings.
- Improved Admin Panel presentation (existing admin actions unchanged).
- Existing gameplay, Online API, Voice Chat, account management, and game storage logic retained from Phase 19.

## WebStorm
1. Unzip, open `armkerp-build` as a project.
2. Run `npm install`, then `npm test`, then `npm start`.
3. Browse http://localhost:3000. Admin: http://localhost:3000/admin.html.
4. Back up the **existing** SQLite database before replacing or moving installations. Do not overwrite the live data file blindly.

## Practical release checklist
- Test all four navigation tabs on desktop and phone.
- Play a complete local match and verify scoring/results.
- Test two online accounts: room, ready, match, rematch, voice join/mute, friend invite.
- Check that admins can sign in, suspend/restore a test user, and view audit entries.
- Test microphone permissions. Voice needs HTTPS or localhost; internet-wide connections may need TURN.
- Verify private-room invites and user permissions on a deployed server before inviting the public.
- Publish with HTTPS, backups, restricted cross-origin access, secrets management, deployment monitoring and rate limiting before public launch.

## Hosting notes
This project requires a running Node.js process and writable SQLite database. GitHub Pages alone cannot host its API/voice signaling. A hosting provider with persistent storage is required. Existing test coverage is **not** a full penetration test, load test or end-to-end browser test.
