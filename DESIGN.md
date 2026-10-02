# Patient Playroom design system

## Direction
A welcoming game shelf for pediatric waiting rooms. Calm, Apple-inspired surfaces and familiar controls surround colorful illustrations and large, tactile game pieces. Younger children have a simple starting point; older children can still choose puzzles and 3D adventures.

## First viewport and interaction
The welcome leads into the newly featured Robot Route, alongside quick starts for Bubble Pop and Puzzle Postcards. Ten game cards follow, filtered by five calm categories. Each card has a visible play icon and a plain-language description. Starting a game is explicit. Match Club defaults to three pairs, with a six-pair option on its introduction.

Pause, Escape, hidden-tab detection, and a labeled appointment exit remain available. Opening Play settings pauses an active game; closing it leaves the game paused until the player chooses Keep playing. Returning to the library focuses the exact card or featured shortcut used to launch. Home clears any category filter. Completion waits for a choice: Play again starts a fresh round immediately, All games returns to the library, and Change game options returns to setup. Sky Dash has no empty options control.

Start playing appears before the collapsed How to play and Game options disclosures, keeping the default path short. Pace choices use grouped, labeled buttons with an explicit check and pressed state. Nine games default to Take my time, which removes the countdown and exposes Finish this round; a short timed break is optional. Café thank-you scenes wait for Next friend. Relaxed memory reveals wait for Turn them over. A How to play control pauses the round and repeats its controls in a panel that expands with text. Resume restores the previous available game control. Studio uses a three-step indicator and keeps the portrait visible after completion. Bubble Pop waits for All done. Postcards provides a visible reference, a four- or six-piece board, tap-to-place input, and a labeled Show me where hint. Garden uses a visible four-step growth sequence. Both new creative results retain their artwork.

## Tokens and components
- Typography throughout: platform system font (-apple-system, BlinkMacSystemFont, SF Pro, Helvetica Neue, Segoe UI, sans-serif). Apple platforms supply SF Pro through the system; other platforms use their available fallback. No font download is required.
- Page #f5f6fa; ink #1d2532; secondary text #556173; interaction blue #075bc7.
- Glass navigation, category controls, session headers and settings use a translucent white surface, a subtle border and a blurred backdrop. Game boards remain opaque. Primary actions use blue with white text.
- Mint, lilac, pink, blue, yellow and peach identify game artwork; shapes and labels carry meaning independently of color.
- Rounded game cards (22px), hero cards (26px), segmented category buttons (14px), and a native settings dialog (28px).
- Controls have visible focus, pressed states and disabled states. Primary touch controls are at least 44px tall. Bubble targets remain stationary and at least 64px tall.
- Bubble art reuses the original SVG creature cast inside CSS-rendered spheres; it requires no additional image download.

## Comfort and accessibility
Play settings uses familiar labeled switches with descriptions for optional sound, calmer motion, bigger text, and solid backgrounds. It supports Escape, forward/reverse focus cycling, and modal background isolation. Motion and text choices persist locally with graceful storage failure. Sound remains off at each fresh load.

Device motion reduction is always honored. The app's calmer-motion preference can add motion reduction, but cannot turn off a device request. Bigger text sets the root size to 125%; layouts also support browser text enlargement. Glass effects are a web adaptation of Liquid Glass, not native Apple components. Solid backgrounds disables backdrop effects and persists locally. Increased contrast and reduced transparency also remove blur; unsupported browsers get an opaque fallback. These choices follow the emphasis on control size, spacing, contrast and gentle motion in [Apple’s accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility).

## Responsive behavior
Three catalog columns on wide screens and single-column picture-and-label rows on phones. Mobile rows preserve a recognizable illustration and readable game description. On phones the wordmark shortens, sound and settings retain visible labels, and the appointment action keeps the full “My appointment” label. Features stack vertically; the two quick starts share a row and stack on the narrowest screens. Detailed intro controls are available in a native How to play disclosure. Bubble Pop changes from four columns to three, while Café snack choices and Studio choices stay large and picture-led. Sky Dash retains its responsive flat graphics fallback.

## Source of truth and validation
`src/game/apple-ui.css` provides the final system typography, glass, reflow and accessibility overrides. `src/game/playful-premium.css` builds on the shared rules in `playroom.css` and `mobile-accessibility.css`. `ComfortSettings.tsx`, `BubbleArt.tsx`, `games/Bubbles.tsx`, `games/PuzzlePostcards.tsx`, `games/postcardArt.tsx`, and the updated game/session components implement the behavior above.

QA covers desktop and emulated mobile Chrome, all game intros/active/paused screens, keyboard input, appointment exit, 320px reflow, 200% text, increased text spacing, device motion changes and unavailable local storage. Automated accessibility checks are a guardrail; patient usability and physical iOS/assistive-technology testing remain separate work. See ACCESSIBILITY.md.
