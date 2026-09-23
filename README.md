# Patient Playroom

A complete redesign of the existing React waiting-room playground for pediatric patients, from younger children to teens. Ten seated games, with Robot Route newly featured, original cover art, a genuine Three.js adventure, and an instant appointment exit.

## Play

| Game | How it works | Optional short break |
| --- | --- | --- |
| Robot Route | Queue up to 20 arrows, test and edit your route, collect three stars, and reach the dock. Three solvable maps, hints, undo and clear. | 3 minutes |
| Bubble Pop | Tap twelve large, stationary bubbles to reveal happy friends. No wrong taps, chasing, or reading needed during play. | 2 minutes |
| Sky Dash | Steer a hoverboard across three lanes, collect gems, jump coral blocks, build a collection combo. Bumps never end the ride. | 75 seconds |
| Maze Quest | Solve a fresh connected maze with arrow keys, direction buttons or one-step swipes. Hint reveals the next step. | 3 minutes |
| Match Club | Choose three or six pairs; mismatches briefly lock input and then turn back. | 3 minutes |
| Three in a Row | Tic-tac-toe with a tactical computer or another person on the same device. | 2 minutes |
| Puzzle Postcards | Assemble one of three original illustrated postcards with four or six pieces; tap a piece, then its space. Reference and optional hints stay available. | 3 minutes |
| Pocket Garden | Choose, water and grow three flowers; keep the finished garden on the result screen. | 2 minutes |
| Critter Café | Match each friendly customer to a picture snack. Wrong guesses are gentle prompts with no penalty. | 2 minutes |
| Silly Studio | Make a keepsake friend by choosing a character, hat and place. Every choice is a good one. | 2 minutes |

The table shows optional short-break durations. Nine games default to “Take my time”: no countdown, with an explicit Finish this round button. Players can select a short timed break before starting. Sky Dash remains a 75-second ride. There is no automatic replay. Time spent paused or in another tab does not consume a round. “My appointment” stops the game immediately and turns sound off. Scores are per-round only; there are no leaderboards, unlocks, daily streaks, ads, purchases, accounts or chat.

Bubble Pop keeps the completed board until All done. Puzzle Postcards and Pocket Garden keep the child’s finished artwork. Critter Café waits for Next friend after each snack so children can enjoy the response at their pace. Relaxed Match Club keeps mismatched cards visible until Turn them over is chosen. Silly Studio retains the finished portrait on its result screen. How to play pauses any game and shows its controls; resuming returns keyboard focus to the previous available game control.

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
- The device reduced-motion preference is respected automatically, including changes while the app is open. Decorative motion stops and Sky Dash uses a steadier view. Play settings also offers calmer motion and bigger text; those two preferences stay on this device.
- Every game supports keyboard and touch controls. The appointment button remains labeled on phones. Interactive controls have visible focus, with explicit feedback for matching, turns, hints and results.
- Keyboard focus moves directly into games and pause/results screens, and returns to the selected game card when leaving a game. Opening Play settings pauses play; closing it does not resume the game automatically. Single-key shortcuts only work when focus is inside the relevant game.
- WebGL failure or context loss switches the adventures to a playable flat view. Scenes dispose their geometries, materials, renderer, observers, events and animation frame on exit.
- A monotonic active-play clock has one completion guard, so StrictMode, delayed callbacks and throttled tabs cannot record a completion twice.

## Data

No patient information is requested. The retained pilot counters record only aggregate app opens, game starts, active seconds and rounds finished in `localStorage` under `mvp.pilot.v1`. “Rounds finished” includes a round ended by its time cap; an appointment exit does not count as a finished round. The staff-data interface is removed; these local counters can be cleared with the browser’s site data. Comfort choices use `playroom.comfort.v1`; sound is never persisted. Malformed or unavailable storage cannot block play. The game code sends no analytics to a server.

## Implementation

- `src/game/GameApp.tsx`: library, categories, sound/motion controls, appointment exit.
- `src/game/GameSession.tsx`: instructions, round lifecycle, pause, results, lazy 3D loading.
- `src/game/ComfortSettings.tsx`: accessible settings dialog, local comfort preferences.
- `src/game/playful-premium.css`: Apple-inspired surfaces, responsive game shelf and new game styles.
- `src/game/roundClock.ts`: pause-aware monotonic clock.
- `src/game/logic.ts`: pure, injectable-randomness game rules.
- `src/game/games/ThreeGames.tsx`: actual Three.js worlds and playable graphics fallbacks.
- `src/game/games/`: each activity's input and display.
- `src/game/playroom.css`: redesigned responsive UI and game styling.
- `tests/logic.test.ts` and `tests/e2e/playroom.spec.ts`: repeatable verification.
- `public/art/PROVENANCE.md`: exact prompts for the original cover images.

The original creature illustrations are shared across activities. Pattern Parade was replaced with Puzzle Postcards to add spatial assembly alongside memory and snack matching; Robot Route joins the curated library as its tenth game and main feature. Generated art is cover art, not a screenshot of the 3D gameplay. The Sky Dash world echoes its cover with segmented lavender arches, a curved mint track, floating islands, waterfalls, a glowing hoverboard and a headphone robot. Bounded particles and shared geometry keep effects lightweight. The Postcards, Garden, Café and Studio activities use local SVG illustrations so picture choices stay clear and fast on clinic Wi-Fi.

## Validation scope

The rule suite checks Robot Route solvability, hints and collision rules, maze generation, every reachable nonterminal tic-tac-toe board, memory input locking, collision and jump timing, device counters and pause timing. Browser tests cover all ten game flows, complete playthroughs, touch/keyboard controls, picture-first Café and Studio choices, time caps, appointment exits, hidden tabs, motion preferences, graphics fallbacks, storage failure, accessibility, and responsive layouts.

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the criterion scope and remaining assistive-technology validation. These tests establish the implemented behavior. They do not establish clinical effectiveness or enjoyment for every patient. Physical iOS/Safari, screen-reader user testing, and observation with patients and hospital staff have not been performed.

## Hosting

This workspace is configured for static Sites hosting through `.openai/hosting.json`. The production artifact is `dist/`; no server database or secret is needed. The Sites deployment is initially private to the owner.

Technical references: [Three.js scene setup](https://threejs.org/manual/en/creating-a-scene.html), [Three.js resource cleanup](https://threejs.org/manual/en/cleanup.html), and [Playwright clock testing](https://playwright.dev/docs/clock).
