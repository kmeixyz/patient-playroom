# Patient Playroom

A complete redesign of the existing React waiting-room playground for pediatric patients, particularly young teens. Ten seated, short-session games, original cover art, genuine Three.js adventures, and an instant appointment exit.

## Play

| Game | How it works | Maximum active round |
| --- | --- | --- |
| Sky Dash | Steer a hoverboard across three lanes, collect gems, jump coral blocks, build a collection combo. Bumps never end the ride. | 75 seconds |
| Orbit Pop | Collect 18 planets. Follow the gold-ring bonus target for an extra spotting challenge. | 60 seconds |
| Maze Quest | Solve a fresh connected maze with arrow keys, direction buttons or one-step swipes. Hint reveals the next step. | 3 minutes |
| Match Club | Match six pairs; mismatches briefly lock input and then turn back. | 3 minutes |
| Merge 128 | Familiar sliding-number puzzle: combine equal numbers, aiming for 128. Includes one-step undo. | 3 minutes |
| Three in a Row | Tic-tac-toe with a tactical computer or another person on the same device. | 2 minutes |
| Word Scout | Find five space words using their endpoints, forwards or backwards, including diagonals. | 3 minutes |
| Hidden Friends | Find five characters in either of two illustrated rooms; help highlights one. | 2 minutes |
| Room Explorer | Discover the original hidden friends by tapping objects in either room. | 2 minutes |
| Beat Garden | Play four musical pads and animate the original characters with taps or keys 1–4. | 60 seconds |

All games stop on completion or at the maximum active time. There is no automatic replay. Time spent paused or in another tab does not consume a round. “My appointment” stops the game immediately and turns sound off. Scores are per-round only; there are no leaderboards, unlocks, streaks, ads, purchases, accounts or chat.

## Running locally

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

The game library is the only route. The Design brief and its source files have been removed. “How it works” explains the current behavior.

```sh
npm run build       # TypeScript and production Vite build
npm run preview     # Serve the production build
npm test            # Pure rules, generated puzzles and timing invariants
npm run smoke       # Render the library and verify removed controls stay absent
npm run test:e2e    # Desktop + emulated phone Chrome tests; keep dev server running
```

The browser suite uses installed Chrome (`channel: chrome`). If needed, install it or adjust the browser channel in `playwright.config.ts`. It writes screenshots and a JSON report to `artifacts/`. Failure traces go to `test-results/`. These directories are ignored by Git.

## Behavior and accessibility

- Sound is off on every app load, uses quiet synthesized tones, and is never required to play. Fonts and imagery are served locally.
- The device reduced-motion preference is respected automatically, including changes while the app is open. Decorative motion stops and Sky Dash uses a steadier view. The leaf toggle has been removed.
- Every game supports keyboard and touch controls. The appointment button remains labeled on phones. Interactive controls have visible focus, with explicit feedback for matching, turns, hints and results.
- Keyboard focus moves directly into games and pause/results screens. Single-key shortcuts only work when focus is inside the relevant game.
- WebGL failure or context loss switches the adventures to a playable flat view. Scenes dispose their geometries, materials, renderer, observers, events and animation frame on exit.
- A monotonic active-play clock has one completion guard, so StrictMode, delayed callbacks and throttled tabs cannot record a completion twice.

## Data

No patient information is requested. The retained pilot counters record only aggregate app opens, game starts, active seconds and rounds finished in `localStorage` under `mvp.pilot.v1`. “Rounds finished” includes a round ended by its time cap; an appointment exit does not count as a finished round. The staff-data interface is removed; these local counters can be cleared with the browser’s site data. Malformed or unavailable storage cannot block play. The game code sends no analytics to a server.

## Implementation

- `src/game/GameApp.tsx`: library, categories, sound/motion controls, appointment exit.
- `src/game/GameSession.tsx`: instructions, round lifecycle, pause, results, lazy 3D loading.
- `src/game/roundClock.ts`: pause-aware monotonic clock.
- `src/game/logic.ts`: pure, injectable-randomness game rules.
- `src/game/games/ThreeGames.tsx`: actual Three.js worlds and playable graphics fallbacks.
- `src/game/games/`: each activity's input and display.
- `src/game/playroom.css`: redesigned responsive UI and game styling.
- `tests/logic.test.ts` and `tests/e2e/playroom.spec.ts`: repeatable verification.
- `public/art/PROVENANCE.md`: exact prompts for both original cover images.

The original editable room and creature illustrations are retained for discovery play. Generated art is cover art, not a screenshot of the 3D gameplay. The 3D worlds now echo the covers with segmented lavender arches, a curved mint track, floating islands, waterfalls, a glowing hoverboard, a headphone robot, orbit rings, cratered planets and crystals. Bounded particles and shared/instanced geometry keep effects lightweight. Cover files are WebP, approximately 177 KB and 218 KB; 3D code loads only when selecting a 3D game.

## Validation scope

The rule suite checks hundreds of maze and word-search seeds, every reachable nonterminal tic-tac-toe board, merge conservation and single-merge rules, memory input locking, collision and jump timing, stale planet targets, optional bonuses, device counters and pause timing. Browser tests cover all ten game flows, complete playthroughs, touch/keyboard controls, time caps, appointment exits, hidden tabs, motion preferences, graphics fallbacks, storage failure, accessibility, and responsive layouts.

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the criterion scope and remaining assistive-technology validation. These tests establish the implemented behavior. They do not establish clinical effectiveness or enjoyment for every patient. Physical iOS/Safari, screen-reader user testing, and observation with patients and hospital staff have not been performed.

## Hosting

This workspace is configured for static Sites hosting through `.openai/hosting.json`. The production artifact is `dist/`; no server database or secret is needed. The Sites deployment is initially private to the owner.

Technical references: [Three.js scene setup](https://threejs.org/manual/en/creating-a-scene.html), [Three.js resource cleanup](https://threejs.org/manual/en/cleanup.html), and [Playwright clock testing](https://playwright.dev/docs/clock).
