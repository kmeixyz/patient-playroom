# Patient Playroom design system

## Direction
A bright pocket arcade for a waiting room: original 3D adventure covers, tactile puzzle previews, expressive but legible lettering, and a quiet frame around the action. Kid friendly without using nursery copy or rewards that make leaving costly.

## First viewport and interaction
The first screen shows a short welcome, five game filters, and two directly playable 3D features. The full ten-game library follows. Selecting a game shows its objective, controls, and bounded duration. Start is explicit; no game starts on page load. Pause, keyboard Escape, hidden-tab detection, and a labeled appointment exit give the player control. Completion is a full stop with an explicit way to set up another round.

## Tokens and components
- Display: self-hosted Fredoka Variable. Body: self-hosted Nunito Sans Variable.
- Page #f7f8fc; ink #232c40; secondary text #596175; interaction blue #465cdb.
- Activity colors: mint, lilac, pink, sky blue, ochre, peach. They organize activities; all controls also have text or distinct shapes.
- Spacing follows 4/8px increments, with larger gaps between functional groups.
- Rounded game frames; pill-shaped navigation; tangible, pressed puzzle pieces.
- Phosphor icons throughout the new shell. Preserve the original editable creature/room art in the two discovery activities.
- Main actions have at least 44px target height, with larger directional and 3D controls. Word-search cells shrink in width on the smallest phones to keep the whole grid available.
- Explicit focus rings, disabled controls, paused overlays, loading and graphics-fallback states. The staff-data panel, Design brief, leaf toggle, duplicate navigation and duplicate Orbit controls have been removed.

## Responsive and motion behavior
Four catalog columns on wide screens, three on tablets, two on most phones, one on narrow or enlarged-text layouts. The wordmark shortens and appointment text remains visible on phones. 3D scenes fit their actual containers; device pixel ratio is capped. Motion reduction automatically follows device changes and freezes decorative movement; Sky Dash uses a steadier overhead view. Functional object movement remains necessary to play Sky Dash. No flashing effects or automatic replay.

## UI skill synthesis
All small style-system SKILL.md files in the installed UI catalog were read with duplicate boilerplate removed. Their shared requirements—semantic tokens, clear hierarchy, complete states, responsive behavior, readable contrast and keyboard support—were applied across the product. Incompatible aesthetic prescriptions were resolved against the user's hospital/young-teen brief rather than combining every palette and typeface.

Primary contributions: friendly/clean/spacious for clarity; colorful/creative/expressive for art; sega/tetris/pacman for short arcade rounds and tactile boards; bento/roku for the library; perspective/claymorphism/fantasy/cosmic for dimensional adventures; minimal/premium/refined for restrained chrome; editorial/basic/paper for readable staff content; contemporary/material/shadcn/ant for state consistency; agentic/levels for direct outcomes; storytelling/immersive for distinct round journeys. The remaining catalog styles supplied common accessibility and consistency checks rather than conflicting visual costumes. Impeccable, design-taste, redesign-existing-projects and Playwright guidance informed implementation and QA.

## Implementation truth
Source of truth: src/game/playroom.css, src/game/mobile-accessibility.css and the game components. These notes describe the implemented design, not an approved visual mockup. Generated covers are illustrative key art; actual 3D play is rendered with Three.js. Its geometry now carries the covers’ lavender arches, curved mint road, floating islands, waterfalls, neon hoverboard, headphone robot, cratered planets and crystals. Fixed particle pools, instanced road geometry and capped pixel density keep the scenes lighter for waiting-room devices.
