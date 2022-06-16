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
  - Fixture test mode
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
  - Display order of fixtures in preview
  - Button instead of fader
  - In a row: repeat n times
  - Alternating: alternate after n fixtures
  - Rename live memories
- Chases
  - Rename
  - Pre-configured / presets (including multi-color presets)
  - Color distribution: random, equal, relative
  - Turn off other chases while in burst mode
- Dymamic pages
  - Improve layout + editing
  - Multiple widgets of the same type (e.g. memories)
- Configuration
  - Fixtures: Show amount of channels for fixture type
  - Fixtures: Default to first free channel, warn about overlapping fixtures
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

- Properly document code
- Performance: manual DOM operations for universe changes (especially with fading)
- React Error Boundaries
- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
