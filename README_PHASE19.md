# Phase 19 — Admin Panel & Account Moderation (Beta)

## What changed
- New admin screen `/admin.html`: server counts, paginated users, suspend/restore, moderation audit.
- Admin permission checked by server via `admin_users` table, not a browser toggle.
- Only locally provisioned admins can access `/api/admin/*`. There is no default admin account or secret.
- Suspensions revoke online sessions and block new Online login. Existing SSE connections may remain until disconnect; treat immediate stream termination as a future hardening task.
- Existing game and multiplayer endpoints are retained.

## WebStorm setup
1. Open `armkerp-build`, run `npm install`, then `npm test`.
2. Back up your existing `database.db` (and related `-wal`/`-shm` when present, after clean server shutdown) before swapping projects. Database path is relative to the process working directory.
3. `npm start`. Register/log in with your normal Online account via `http://localhost:3000`.
4. Stop server with Ctrl+C, then run `npm run admin:grant -- Arm` (replace `Arm` with your exact existing username). Restart with `npm start`.
5. In the SAME browser tab where you logged in, navigate to `http://localhost:3000/admin.html`. Session storage is tab-scoped.

## Important limitations
- Admin interface is **Beta** and is intended for development / trusted operators only. Never expose your computer or this HTTP admin session publicly; deploy behind HTTPS and properly configured hosting with backups and monitoring.
- Admin authorization depends on possession of an existing valid Online bearer token; keep tokens private.
- Rate limiting in Phase 9 is in-memory and not a substitute for production security controls.
- Admin suspend blocks future authenticated actions; already-open streams may take time to end.
- Tests are structural/regression checks, not a complete security audit.
