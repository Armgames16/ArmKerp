# Արմ Կերպ — Pro Ultimate

Armenian team word-guessing game. This package contains the frontend and the Node.js/SQLite backend.

## Frontend preview

Open `index.html` in a browser for a local frontend preview. Features that require an online backend will only work when the API is configured and the backend is running.

## Backend setup

Requirements: Node.js 18+ (Node.js 20+ recommended).

```bash
npm install
npm start
```

The current backend listens on port `3000`. The database is created locally by `database.js`; it is intentionally not included in this source archive so each installation gets its own database.

## Important deployment note

GitHub Pages serves static files only; it cannot run `server.js` or host the SQLite database. Deploy the backend to a Node.js-capable host and configure the frontend API URL to that deployed HTTPS address before enabling real accounts across devices. Do not commit passwords, `.env` files, or database files to a public repository.

## Phase 1 update

- Added a premium-hybrid visual polish layer in `upgrade.css` while keeping the original styles intact.
- Added focus-visible accessibility states and reduced-motion support.
- Added standard Node start scripts and repository ignores.
