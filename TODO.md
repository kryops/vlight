# TODO

## Roadmap

- Universe features
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
  - Apply by map coordinates instead of member order
- Chases
  - Color distribution: random, equal, relative
- Dynamic Pages
  - Multi-control widgets
- New Controls
  - All off (permanently, <> blackout)
  - Programmable buttons
  - Non-live chases
  - Sequences/shows
- Inputs
  - Custom keybindings
  - LaunchPad input
  - XTouch input
  - External input mapping

## Tech

- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
