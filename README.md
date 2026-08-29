# Waiting Room Playground — MVP prototype

A web version of the **Medical Virtual Playground (MVP)**: a mobile-first
collection of short, low-pressure activities for children waiting in a pediatric
outpatient waiting room or clinic room.

The repo holds two things:

| Route | What it is |
| --- | --- |
| `/` | The playable prototype — six activities a child can start and stop freely |
| `/#brief` | The design brief the prototype is built from, as a readable site |

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173`) and opens it
automatically. It is designed for a phone screen — use your browser's device
toolbar at ~390×844 to see it as a family would.

## The activities

| Activity | What the child does | Why it is in the set |
| --- | --- | --- |
| Look around | Taps chairs, a door, a fish tank, a drawer to reveal a hidden friend | Visual discovery and connection to the room |
| I spy | Finds five friends hiding in the room, with a Help button | Simple rules, brief play, no way to get stuck |
| Find pairs | Turns over cards to match pairs | Familiar, repeatable, gentle reinforcement |
| Three in a row | Tic-tac-toe against the app or a caregiver | Familiar and easy to understand |
| Maze | Slides a character through a fresh maze to a flag | Focus without a learning curve |
| Silly dance | Taps a character to make it move for a moment | Lowest-effort, humorous interaction |

Two illustrated rooms — a waiting room and a clinic room — back the first two
activities, so play continues after the child is called back.

## How the brief's guardrails are implemented

- **No failure states.** No timers, scores, levels, or lose messages. A non-match
  simply turns back over; the app's tic-tac-toe opponent is deliberately
  imperfect and varied so a child wins often, and a win by the app is phrased as
  an invitation to play again.
- **Stop at any moment.** A large *Games* button is always in the header, and
  leaving an activity never costs progress.
- **Sound off by default.** Audio is quiet synthesized tones, is never assumed,
  and the preference is intentionally not persisted, so every open starts silent.
- **No flashing, no rapid motion.** Reveals fade, cards flip slowly, and
  `prefers-reduced-motion` removes animation entirely.
- **Visually led.** Large touch targets (nothing under 44px), first-grade-level
  labels, and icon-first navigation. Reading is never required to play.
- **Seated play only.** Everything is tap or short slide. No tilt, no camera, no
  augmented reality, no precise gestures.
- **No identifiable data.** No accounts, no names, no appointment details, no
  location, no network calls. See below.
- **No brand assets.** All artwork is inline SVG drawn for this prototype. No
  Lurie logos, photographs, or characters are used — those require confirmed
  permission and approved files.
- **Light and offline-friendly.** No images or icon fonts to download; the whole
  bundle is well under 100 kB gzipped.

## Pilot measurement

The brief asks the design to *enable* engagement data collection while collecting
nothing identifiable. The footer's **Pilot data** panel shows anonymous counters
kept in `localStorage` only: app opens, activity switches, and per-activity opens,
time, and completions. Nothing is transmitted, and the panel can copy the JSON or
clear it. Swapping the functions in `src/game/analytics.ts` for real endpoints is
the only change needed to report to a pilot backend.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Typecheck and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run TypeScript with no emit |
| `npm run smoke` | Render both routes in Node and assert key content is present |
| `npm run tour` | Play through every activity in headless Chrome (see below) |

### The tour

`npm run tour` drives a real browser over the DevTools Protocol against a running
dev server, at a 390×844 phone viewport. It checks touch target sizes, that no
layout overflows horizontally, that taps reveal friends, that cards flip, that the
maze character follows a finger without entering a wall, that a win is phrased
kindly, that sound starts off, and that counters increment without recording
identifiers. Screenshots land in `.shots/`.

```bash
npm run dev            # in one terminal
npm run tour           # in another; defaults to http://localhost:5180
npm run tour -- http://localhost:5173
```

It requires Google Chrome installed at the standard macOS path.

## Project structure

```
index.html                Document shell, favicon, font links
public/favicon.svg
src/
  main.tsx                React entry point
  App.tsx                 Hash routing between the game and the brief
  styles.css              Brief styles
  game/
    GameApp.tsx           Shell: header, menu, activity switching, time tracking
    gameList.ts           The activity menu as data
    creatures.tsx         The shared cast, drawn as inline SVG
    scenes.tsx            Waiting room and clinic room artwork plus tap targets
    ui.tsx                Shared play-screen pieces (stage, room picker, dots)
    analytics.ts          Anonymous on-device counters
    sound.ts              Optional quiet audio, off by default
    PilotData.tsx         Staff-facing view of the counters
    game.css              Child-facing styles
    games/                One file per activity
  brief/BriefPage.tsx     The brief page composition
  content/brief.ts        All brief copy as typed data
  components/, sections/, hooks/   Brief UI
scripts/                  smoke.mjs, tour.mjs, probe.mjs, shots.sh
```

## Editing

- **Activity copy and the menu:** `src/game/gameList.ts`.
- **Room artwork and what hides where:** `src/game/scenes.tsx`. Art is drawn in a
  400×260 viewBox; hotspot coordinates use the same units, so a tap target always
  lines up with the object at any screen size.
- **Characters:** `src/game/creatures.tsx`. Adding a `CreatureKind` makes it
  available to every activity at once.
- **Brief text:** `src/content/brief.ts`.

## Status and known gaps

Draft prototype for team alignment and usability testing, not a patient-facing
product. Deliberately out of scope for now, per the brief: hospital system
integration, approved Lurie artwork, real analytics endpoints, a word search for
older children, and the QR-code entry point (any static host will serve the built
`dist/` behind a short link).
