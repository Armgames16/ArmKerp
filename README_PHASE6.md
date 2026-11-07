# Phase 6 — Player Profiles & Progression

Adds account-specific XP, levels, game totals, total points, best combo and six persistent achievements. XP per finished game: 50 + 10 × total team points + 5 × best combo (capped at 10). Level thresholds: 100 × (level − 1)². Progress is saved locally in the browser, keyed by account ID or username; it is **not synced to the backend or other devices**. Guest games do not earn persistent XP. Prior game history is not retroactively counted. No new dependencies.
