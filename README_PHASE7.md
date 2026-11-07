# Phase 7 — Daily Challenges & Rewards

## What's new

Three daily quests (reset at **local midnight**, based on the player's device date):

- 🎮 Complete one full game → **75 XP**
- 🧠 Guess ten words → **100 XP**
- 🔥 Reach a five-word combo → **125 XP**

Finish a quest and press **Ստանալ** (Claim) in the setup, winner or profile panel to collect XP. Quest progress is shared among these three panels. Claimed rewards add to the existing Phase 6 XP and can trigger level-ups. Claiming a reward on consecutive calendar days builds a streak; skipping a day resets it on the next claim.

## Technical notes

- Uses the existing per-account `getCurrentUser()` identity. Guests cannot claim or save daily progress.
- Stores daily quest counts under `armkerp_daily_v1_<account ID>` in localStorage.
- Phase 6 also saves unique reward IDs in the same localStorage progress record as XP, preventing duplicate XP awards even on repeated clicks or partial writes.
- Existing game XP and permanent achievements remain unchanged. The existing SQLite backend is not involved.
- **Local only:** no cross-browser/device synchronization, no server-clock verification, and no cheat protection against editing localStorage or changing the system clock. Do not present as a real-money or competitive reward mechanism.
- Existing account passwords are stored locally by legacy code; this update does not add server authentication.
- Run `node --check script.js && node --check phase6.js && node --check phase7.js` to verify JavaScript syntax.
