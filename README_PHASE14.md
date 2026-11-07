# Arm Կերպ — Phase 14: Premium Voice UI (Beta)

Includes Phase 13 and previous features.

## New
- Separate local playback volume sliders per connected remote speaker (0–100%)
- Voice-activity indicators based on local Web Audio RMS (not transmitted to server)
- Speaking status for your own mic (respects mute) and connected remote peers
- Speaker cards with names, volume, and responsive layout

## Usage
1. Open `armkerp-build` in WebStorm.
2. `npm install` and `npm start`.
3. Open http://localhost:3000, log in as two separate players and join the same room.
4. Each player clicks Join Voice Chat and grants microphone access.
5. Speak, verify the green speaking indicator and change the other participant's volume.

## Notes
- Playback volume is per browser session; it does not alter other users' microphone level.
- Voice activity indication is an approximate audio-level threshold, not speech recognition.
- HTTPS or localhost is required for microphone permissions; remote connection may require TURN.
- Headphones recommended when testing two accounts on one device.
- Syntax was checked; two-device browser verification is still required.
