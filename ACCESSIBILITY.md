# Accessibility review

Review target: [WCAG 2.2 Level AA](https://www.w3.org/WAI/WCAG22/quickref/), with additional mobile, reduced-motion and high-contrast checks. This is an implementation review, not a certification that every WCAG success criterion has been met.

## Coverage

Every game is scanned in its instructions, active-play and paused states on desktop Chrome and emulated mobile Chrome. The automated suite uses axe-core's WCAG 2.0, 2.1 and 2.2 A/AA rules. All nine games are also checked at 320px, at 200% text size, and with increased letter spacing, word spacing, line height and paragraph spacing. Interactive game targets are checked against the 24 CSS-pixel AA minimum; primary touch controls are generally 44–58px or larger.

| Activity | Accessibility provisions |
| --- | --- |
| Bubble Pop | Twelve stationary native-button targets, keyboard activation and next-bubble focus, named revealed friends, progress announcements, pause-aware completion and motion reduction. |
| Sky Dash | Large steering/jump buttons, keyboard and swipe alternatives, textual lane and upcoming-item descriptions, live catch feedback, shape-based gem/block distinction, pause, steadier reduced-motion camera. |
| Maze Quest | High-contrast walls and player, keyboard and single-step touch gestures, equivalent direction buttons, hint, position announcement. |
| Match Club | Three-pair starter board or explicit six-pair choice, labeled cards, pair counts and reveal announcements, text/shapes for matching states, input locking that prevents third-card errors. |
| Three in a Row | Labeled squares, X/O shapes rather than color alone, turn announcements, explicit solo/two-player choice. |
| Hidden Friends | Named scene targets, keyboard activation, help highlight, remaining count. |
| Beat Garden | Large labeled pads, focus-scoped key shortcuts, visual feedback independent of sound, reduced-motion support. |
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

Seven puzzle, discovery and creative games allow the countdown to be disabled before play through Take my time. Relaxed Match Club leaves mismatches visible until the player chooses Turn them over. Critter Café waits for an explicit Next friend action, with keyboard focus advancing to that action after keyboard serving. All games expose paused instructions and restore the last available game control on resume. The pause panel expands with enlarged text instead of clipping its controls.

Automated rules do not cover all WCAG requirements. Physical iOS/Safari, VoiceOver, TalkBack, NVDA, switch access and testing with pediatric patients have not been performed. Visual search and reflex gameplay may need further alternative interactions for some players. Sky Dash and Beat Garden retain timed sessions; no claim of complete AAA conformance is made.

Repeatable evidence: `tests/e2e/accessibility.spec.ts`, `tests/e2e/input-graphics.spec.ts`, `tests/e2e/comfort-bubbles.spec.ts`, `tests/e2e/playroom.spec.ts`. Generated reports and captures are in the ignored `artifacts/` directory. A passing automated scan is reported as zero detected violations, not proof of universal accessibility.
