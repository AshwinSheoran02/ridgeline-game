# Ridgeline

A browser first-person shooter set in Tirthkot, a Himalayan hill town above river ghats. Team deathmatch against bots, playable with keyboard and mouse, touch or a gamepad.

Built with three.js (r149, loaded from jsDelivr). Everything else, including textures, models, audio and post-processing, is generated in code.

## Features

- Two weapons: VK-30 rifle and M12 Breacher shotgun, plus cookable frag grenades
- Destructible LPG gas cylinders with chain reactions
- Bots that use cover, flank, throw grenades and call out on the radio
- Random half-map spawns each match
- Mantling, sliding, ragdolls
- Custom post-processing: ambient occlusion, bloom, sun shafts, tone mapping
- Automatic quality and resolution scaling
- Online play with friends: peer to peer, up to 8 players, bots fill empty slots
- Touch controls for phones and tablets, plus gamepad support

## Online play

Open the menu, choose PLAY ONLINE, enter a name and HOST A GAME. Share the room code or the invite link (`?room=CODE`). The host's browser runs the match (bots, grenades, score) and other players connect to it directly over WebRTC. PeerJS's free public server is only used to introduce the players to each other.

- Modes: team deathmatch, or co-op where all players fight a bot squad
- If the host leaves, the match ends. If a player leaves, a bot takes their slot.
- Some strict networks block direct connections; those players need a TURN relay (not set up yet).
- For same-browser testing, open two tabs with `?netlocal=1` (uses BroadcastChannel instead of PeerJS).

## Run locally

```
node build.mjs
```

Then open `dist/index.html` in a browser, or serve the folder with any static server (`npx serve dist`).

## Project layout

- `src/head.html`: page markup and CSS (HUD, menus, loader)
- `src/16b_net.js`: online play (lobby, PeerJS transport, snapshots, replicas)
- `src/01_core.js` to `src/17_flow.js`: game modules, concatenated in filename order into one script
- `build.mjs`: builds `dist/index.html` and syntax-checks the script

## Deploy

Vercel reads `vercel.json`: build command `node build.mjs`, output folder `dist`. No dependencies to install.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Mouse | Look, left click to fire |
| Right click | Aim down sights |
| Shift | Sprint |
| C / Ctrl | Crouch, or slide while sprinting |
| Space | Jump, or climb a ledge |
| G (hold) | Cook and throw a grenade |
| R | Reload |
| Q / 1 / 2 | Switch weapon |
| Tab | Scoreboard |
| Esc | Pause |
