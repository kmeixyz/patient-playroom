# Accessibility review

Review target: [WCAG 2.2 Level AA](https://www.w3.org/WAI/WCAG22/quickref/), with additional mobile, reduced-motion and high-contrast checks. This is an implementation review, not a certification that every WCAG success criterion has been met.

## Coverage

Every game is scanned in its instructions, active-play and paused states on desktop Chrome and emulated mobile Chrome. The automated suite uses axe-core's WCAG 2.0, 2.1 and 2.2 A/AA rules. All ten games are also checked at 320px, at 200% text size, and with increased letter spacing, word spacing, line height and paragraph spacing. Interactive game targets are checked against the 24 CSS-pixel AA minimum; primary touch controls are generally 44–58px or larger.

| Activity | Accessibility provisions |
| --- | --- |
| Robot Route | Labeled map cells with coordinates and non-color symbols, touch buttons and focus-scoped arrow/WASD commands, editable command queue, live run feedback, hints, undo, clear, stop-test, pause-aware step timing and reduced-motion support. |
| Bubble Pop | Twelve stationary native-button targets, keyboard activation and next-bubble focus, named revealed friends, progress announcements, explicit All done completion and motion reduction. |
| Sky Dash | Large steering/jump buttons, keyboard and swipe alternatives, textual lane and upcoming-item descriptions, live catch feedback, shape-based gem/block distinction, pause, steadier reduced-motion camera. |
| Maze Quest | High-contrast walls and player, keyboard and single-step touch gestures, equivalent direction buttons, hint, position announcement. |
| Match Club | Three-pair starter board or explicit six-pair choice, labeled cards, pair counts and reveal announcements, text/shapes for matching states, input locking that prevents third-card errors. |
| Three in a Row | Labeled squares, X/O shapes rather than color alone, turn announcements, explicit solo/two-player choice. |
| Puzzle Postcards | Four or six tap-to-place pieces, three picture choices, persistent reference, named piece locations and board spaces, explicit selected/placed states, help text and outline, predictable keyboard focus, no penalties, retained finished picture. |
| Pocket Garden | Three flower shapes, explicit Plant/Water/Sunshine/Bloom steps, large buttons, keyboard focus through each step, status announcements and a retained garden. |
| Critter Café | Picture snacks paired with named customers, large native buttons, gentle status feedback, no penalty for wrong guesses and progress semantics. |
| Silly Studio | Three short choice steps, selected-state semantics, picture and text labels, predictable Back/Next controls and a keepsake result. |

## Shared behavior

- Sound begins off and is optional. No speech, prerecorded media, microphone or camera access.
- Device `prefers-reduced-motion` is respected on load and when it changes. Decorative animations stop; essential Sky Dash track motion remains. The Play settings dialog adds a calmer-motion choice and 125% text, with native modal semantics, keyboard cycling and Escape dismissal. Device motion reduction cannot be overridden by the app.
- Pause, Escape, tab hiding, window blur, opening Play settings and appointment exit stop active play. No automatic replay or flashing effects.
- Solid text backgrounds in the 3D controls; darker feature-image overlays; explicit keyboard focus; non-color state indicators; forced-colors and increased-contrast styles.
- Zoom is allowed, both orientations are supported, phone safe areas are respected, and no control depends solely on hover or dragging.
- Local game counters contain no patient information and send no analytics requests. The former staff-data interface and Design brief are removed.

## Validation limits

Nine games default to Take my time with no countdown; short timed breaks are an explicit choice. Relaxed Match Club leaves mismatches visible until the player chooses Turn them over. Critter Café waits for an explicit Next friend action, with keyboard focus advancing to that action after keyboard serving. All games expose paused instructions and restore the last available game control on resume. The pause panel expands with enlarged text instead of clipping its controls.

Automated rules do not cover all WCAG requirements. Physical iOS/Safari, VoiceOver, TalkBack, NVDA, switch access and testing with pediatric patients have not been performed. Visual search and reflex gameplay may need further alternative interactions for some players. Sky Dash retains a timed session; no claim of complete AAA conformance is made.

Repeatable evidence: `tests/e2e/accessibility.spec.ts`, `tests/e2e/input-graphics.spec.ts`, `tests/e2e/comfort-bubbles.spec.ts`, `tests/e2e/playroom.spec.ts`, `tests/e2e/postcards.spec.ts`, `tests/e2e/garden-pattern.spec.ts`, `tests/e2e/robot-route.spec.ts`. Generated reports and captures are in the ignored `artifacts/` directory. A passing automated scan is reported as zero detected violations, not proof of universal accessibility.
