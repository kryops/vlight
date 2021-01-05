# TODO

## Roadmap

- Universe features
  - global blackout
  - swop (single chase active, rest blackout)
  - complete fixture override/reservation (e.g. when controlled by a chase)
- Speed/Fade control
  - global vs local speed
  - global pause/halt
  - global fading (outgoing universe)
- Prepare changes before applying
  - Chases, Memories, Fixture states...
  - Fade/transition
  - kick off multiple changes at once
- Memories extension
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

## Tech

- Performance: manual DOM operations for universe changes (especially with fading)
- yarn 2 pnp / pnpm => still blocked by linaria?
- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
- react-router 6 Beta
