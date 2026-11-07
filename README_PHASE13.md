# Արմ Կերպ — Phase 13: Voice Chat (Beta)

## What changed
- New opt-in **Voice Chat** area inside the online live room.
- Join / Leave microphone controls, local mute/unmute, audio elements for peers.
- Encrypted peer-to-peer WebRTC audio. The Node server relays only offer/answer/ICE signaling over the **existing authenticated REST + SSE** infrastructure, not audio.
- Signaling restricted to registered members of the same online room; server expires signals and voice presence.
- Phase 12 team play, countdown, live game, chat and rematch remain present.
- Includes the corrected Phase 12 `phase10.js` (no markdown fences, corrected lobby loop and SSE parsing).

## Run from WebStorm
1. Extract ZIP, open `armkerp-build`.
2. Keep a backup of your existing database before using a new project directory. If you want existing accounts, migrate your own original database file into this build.
3. In the terminal run `npm install` then `npm start`.
4. Open `http://localhost:3000` in **two separate authenticated browsers or profiles** with different accounts; join the same room.
5. Both users must click `🎤 Միանալ Voice Chat-ին` and allow mic permission. Try speaking and using the mute button.
6. Use headphones to avoid feedback.

## Known limitations
- Beta, **not yet tested with two real browsers/devices** in the generation environment. Syntax and packaging checks are not end-to-end voice tests.
- `getUserMedia` needs a secure context: `http://localhost` works on the server machine, but accessing `http://192.168.x.x:3000` on another phone usually **does not**; use HTTPS with a trusted certificate or HTTPS deployment.
- Public Google STUN is used for NAT discovery. Some internet connections need a **TURN** relay (not bundled), so voice can fail even when the game and live text are connected.
- Browser audio autoplay may require the user to press Play in the visible audio player.
- Voice is shared **room-wide** including across teams, not team-private. No recordings or voice storage in this build.
- Each audio peer creates a separate WebRTC connection; best for small rooms, not 15 simultaneous speakers.
- This is separate from online text logins; never paste your token in public chats or screenshots.
