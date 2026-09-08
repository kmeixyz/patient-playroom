# Accessibility review

Review target: [WCAG 2.2 Level AA](https://www.w3.org/WAI/WCAG22/quickref/), with additional mobile, reduced-motion and high-contrast checks. This is an implementation review, not a certification that every WCAG success criterion has been met.

## Coverage

Every game is scanned in its instructions, active-play and paused states on desktop Chrome and emulated mobile Chrome. The automated suite uses axe-core's WCAG 2.0, 2.1 and 2.2 A/AA rules. All ten games are also checked at 320px, at 200% text size, and with increased letter spacing, word spacing, line height and paragraph spacing. Interactive game targets are checked against the 24 CSS-pixel AA minimum; primary touch controls are generally 44–58px or larger.

| Activity | Accessibility provisions |
| --- | --- |
| Sky Dash | Large steering/jump buttons, keyboard and swipe alternatives, textual lane and upcoming-item descriptions, live catch feedback, shape-based gem/block distinction, pause, steadier reduced-motion camera. |
| Orbit Pop | Stationary numbered native-button targets, keyboard focus and 1–6 shortcuts, text and star-shaped bonus indication, live collection feedback, progress semantics. No duplicate button row. |
| Maze Quest | High-contrast walls and player, keyboard and single-step touch gestures, equivalent direction buttons, hint, position announcement. |
| Match Club | Labeled cards, pair counts and reveal announcements, text/shapes for matching states, input locking that prevents third-card errors. |
| Merge 128 | Number labels with row/column, keyboard and swipe alternatives, direction buttons, one-step undo, distinct occupied tiles. |
| Three in a Row | Labeled squares, X/O shapes rather than color alone, turn announcements, explicit solo/two-player choice. |
| Word Scout | Labeled letter positions, one tab stop with arrow-key navigation, endpoint selection, textual hints and results, underlined found letters. |
| Hidden Friends | Named scene targets, keyboard activation, help highlight, remaining count. |
| Room Explorer | Named object targets, keyboard activation, visible focus, named progress. |
| Beat Garden | Large labeled pads, focus-scoped key shortcuts, visual feedback independent of sound, reduced-motion support. |

## Shared behavior

- Sound begins off and is optional. No speech, prerecorded media, microphone or camera access.
- Device `prefers-reduced-motion` is respected on load and when it changes. Decorative animations stop; essential Sky Dash track motion remains.
- Pause, Escape, tab hiding, window blur and appointment exit stop active play. No automatic replay or flashing effects.
- Solid text backgrounds in the 3D controls; darker feature-image overlays; explicit keyboard focus; non-color state indicators; forced-colors and increased-contrast styles.
- Zoom is allowed, both orientations are supported, phone safe areas are respected, and no control depends solely on hover or dragging.
- Local game counters contain no patient information and send no analytics requests. The former staff-data interface and Design brief are removed.

## Validation limits

Automated rules do not cover all WCAG requirements. Physical iOS/Safari, VoiceOver, TalkBack, NVDA, switch access and testing with pediatric patients have not been performed. Visual search and reflex gameplay may need further alternative interactions for some players. The short-round time limits are retained from the waiting-room product requirement; pause and immediate exit are available, but no claim of unrestricted timing or complete AAA conformance is made.

Repeatable evidence: `tests/e2e/accessibility.spec.ts`, `tests/e2e/input-graphics.spec.ts`, `tests/e2e/playroom.spec.ts`. Generated reports and captures are in the ignored `artifacts/` directory. A passing automated scan is reported as zero detected violations, not proof of universal accessibility.
