# Patient Playroom

## Platform and stack
Web. Existing React 19 + TypeScript + Vite app, retained during the redesign.

## Audience and purpose
Pediatric patients, from younger children to teens, waiting for hospital appointments. Provide short, satisfying, seated activities. Simple tap-to-play activities give younger children an easy starting point, alongside puzzles and 3D adventures for older players.

## Product requirements
- Nine activities: one 3D adventure, three puzzles, a one/two-player board game, and four relaxed activities. Bubble Pop uses large stationary targets; Match Club offers three- and six-pair boards; Critter Café and Silly Studio are picture-first activities for younger patients.
- Eight games default to “Take my time” without a countdown; these end on completion or Finish this round. Players may explicitly choose a short break capped at 120–180 seconds of active play. Sky Dash remains a 75-second timed ride.
- Puzzle Postcards offers three local SVG pictures and four- or six-piece puzzles. Tap-to-place controls, a persistent reference, location labels and hints make dragging unnecessary. Pocket Garden guides three flowers through visible growth steps. Both retain finished artwork.
- Café customer changes and relaxed memory reveals advance at the child's choice. Bubble Pop keeps the completed board until All done. Finished Studio portraits stay visible on the result screen. Instructions remain available during every game through a control that pauses play.
- Every activity has a direct appointment exit. No confirmation, saved streak, automatic replay, endless progression, account, ad, purchase, or social pressure.
- Sound starts off. Motion reduction follows the device preference automatically. Play settings offers additional calmer motion and bigger text; these choices persist locally and tolerate unavailable storage. Opening settings pauses an active game.
- Mouse, keyboard, touch, seated play. No camera, microphone, location or hospital-system access.
- Anonymous aggregate counters remain on the device; the former staff-data interface is removed. No patient information is requested or transmitted by the game code.
- The Design brief and unnecessary controls are removed. The library and all games are optimized for phone use.

## Evidence and open questions
Game-rule and browser testing can establish functional behavior, but enjoyment and suitability have not been validated with actual patients or hospital staff. Device testing covers desktop Chrome and emulated mobile Chrome; physical iOS/Safari and assistive-technology user testing remain separate validation work.

Curation is a design judgment, not a patient-tested ranking: Puzzle Postcards replaces Pattern Parade to broaden the kinds of play without expanding the menu. Medical effectiveness is not claimed.
