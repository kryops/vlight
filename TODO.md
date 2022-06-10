# TODO

## Roadmap

- Universe features
  - global blackout
  - global master
  - all on
  - swop (single chase active, rest blackout)
  - complete fixture override/reservation (e.g. when controlled by a chase)
- Fixture types
  - Control which channels should be tied to the fixture's master
  - Channels with discrete states
  - Fixtures with multiple light sources
  - Moving heads
  - special colors preview (amber, UV)
- New Controls
  - All off (permanently, <> blackout)
  - Programmable buttons
  - non-live chases
  - Sequences/shows
- Speed/Fade control
  - global vs local speed
  - global pause/halt
  - global fading (outgoing universe)
- Prepare changes before applying
  - Chases, Memories, Fixture states...
  - Fade/transition
  - kick off multiple changes at once
- Memories extension
  - button instead of fader
  - in a row: repeat n times
  - alternating: alternate after n fixtures
- Chases
  - Pre-configured / presets (including multi-color presets)
  - Color distribution: random, equal, relative
- Inputs
  - Keyboard shortcuts/keybindings
  - LaunchPad input
  - XTouch input
  - External input mapping
- Improved dynamic pages layout + editing
- Configuration
  - Fixtures: Show amount of channels for fixture type
  - Fixtures: Warn about overlapping fixtures

## Tech

- Performance: manual DOM operations for universe changes (especially with fading)
- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
