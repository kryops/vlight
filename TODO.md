# TODO

## Roadmap

- Universe features
  - Global blackout
  - Global master
  - All on
  - Swop (single chase active, rest blackout)
  - Complete fixture override/reservation (e.g. when controlled by a chase)
- Fixture types
  - Control which channels should be tied to the fixture's master
  - Channels with discrete states
  - Fixtures with multiple light sources
  - Moving heads
  - Special colors preview (amber, UV)
- Map
  - Change size
- Speed/Fade control
  - Global vs local speed
  - Global pause/halt
  - Global fading (outgoing universe)
- Prepare changes before applying
  - Chases, Memories, Fixture states...
  - Fade/transition
  - Kick off multiple changes at once
- Memories
  - Button instead of fader
  - In a row: repeat n times
  - Alternating: alternate after n fixtures
  - Rename live memories
  - Apply by map coordinates instead of member order
- Chases
  - Rename
  - Color distribution: random, equal, relative
  - Turn off other chases while in burst mode
- Dymamic pages
  - Improve layout + editing
  - Multiple widgets of the same type (e.g. memories)
- New Controls
  - All off (permanently, <> blackout)
  - Programmable buttons
  - Non-live chases
  - Sequences/shows
- Inputs
  - Keyboard shortcuts/keybindings
  - LaunchPad input
  - XTouch input
  - External input mapping

## Tech

- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
