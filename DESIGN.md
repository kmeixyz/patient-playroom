# Patient Playroom design system

## Direction
A welcoming game shelf for pediatric waiting rooms. Calm, Apple-inspired surfaces and familiar controls surround colorful illustrations and large, tactile game pieces. Younger children have a simple starting point; older children can still choose puzzles and 3D adventures.

## First viewport and interaction
The welcome leads into Bubble Pop, a stationary tap-to-reveal game, alongside Sky Dash. Nine game cards follow, filtered by five calm categories. Each card has a visible play icon and a plain-language description. Starting a game is explicit. Match Club defaults to three pairs, with a six-pair option on its introduction.

Pause, Escape, hidden-tab detection, and a labeled appointment exit remain available. Opening Play settings pauses an active game; closing it leaves the game paused until the player chooses Keep playing. Returning to the library focuses the selected game card. Completion never automatically starts another round.

Pace choices use grouped, labeled buttons with an explicit check and pressed state. Seven games offer a short break or Take my time; the latter removes the countdown and exposes Finish this round. Café thank-you scenes wait for Next friend. Relaxed memory reveals wait for Turn them over. A How to play control pauses the round and repeats its controls in a panel that expands with text. Resume restores the previous available game control. Studio uses a three-step indicator and keeps the portrait visible after completion.

## Tokens and components
- Display: self-hosted Fredoka Variable. Body: self-hosted Nunito Sans Variable.
- Page #f7f8fa; ink #25322f; secondary text #59645f; interaction blue #375cbe.
- Green feature surface #e4f1e7; green button #2e5f47 with white text.
- Mint, lilac, pink, blue, yellow and peach identify game artwork; shapes and labels carry meaning independently of color.
- Rounded game cards (22px), hero cards (26px), segmented category buttons (14px), and a native settings dialog (28px).
- Controls have visible focus, pressed states and disabled states. Primary touch controls are at least 44px tall. Bubble targets remain stationary and at least 64px tall.
- Bubble art reuses the original SVG creature cast inside CSS-rendered spheres; it requires no additional image download.

## Comfort and accessibility
Play settings uses familiar labeled switches with descriptions for optional sound, calmer motion, and bigger text. It supports Escape, forward/reverse focus cycling, and modal background isolation. Motion and text choices persist locally with graceful storage failure. Sound remains off at each fresh load.

Device motion reduction is always honored. The app's calmer-motion preference can add motion reduction, but cannot turn off a device request. Bigger text sets the root size to 125%; layouts also support browser text enlargement. Text and essential controls remain opaque; blur is confined to the modal backdrop. These choices follow the emphasis on control size, spacing, contrast and gentle motion in [Apple’s accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility).

## Responsive behavior
Four catalog columns on wide screens, three on tablets and two on most phones, with one-column cards where enlarged text needs room. On phones the wordmark shortens, settings retain an accessible name, and the appointment action displays “Called?”. Features stack vertically. Bubble Pop changes from four columns to three, while Café snack choices and Studio choices stay large and picture-led. Sky Dash retains its responsive flat graphics fallback.

## Source of truth and validation
`src/game/playful-premium.css` builds on the shared rules in `playroom.css` and `mobile-accessibility.css`. `ComfortSettings.tsx`, `BubbleArt.tsx`, `games/Bubbles.tsx`, and the updated game/session components implement the behavior above.

QA covers desktop and emulated mobile Chrome, all game intros/active/paused screens, keyboard input, appointment exit, 320px reflow, 200% text, increased text spacing, device motion changes and unavailable local storage. Automated accessibility checks are a guardrail; patient usability and physical iOS/assistive-technology testing remain separate work. See ACCESSIBILITY.md.
