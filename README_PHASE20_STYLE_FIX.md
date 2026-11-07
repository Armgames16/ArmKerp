# Phase 20.1 — Layout & CSS repair

- Fixed the root cause: `phase20.css` existed but was **not linked** from `index.html`.
- Added final, scoped overrides for tabs, legacy module cards, multiplayer lobby, voice UI, friends and rewards.
- Improved responsive layout at 760 / 520 / 350 px, native select contrast, checkboxes and form spacing.
- Existing game JS, backend, and account data are unchanged.
- Test with `npm test` and `npm start`; use browser hard refresh after replacing files.
- No database files included. Keep the old database in place and make a backup first.
