# TODO

## Roadmap

- Universe features
  - All on
  - Swop (single chase active, rest blackout)
  - Complete fixture override/reservation (e.g. when controlled by a chase)
- Fixture types
  - Add different mappings to the same fixture type?
  - Control which channels should be tied to the fixture's master
  - Channels with discrete states
  - Fixtures with multiple light sources
  - Moving heads
  - Special colors preview (amber, UV)
- Fixtures
  - Opt-in to channel preselection
  - Search box
- Groups
  - When deleting a group, replace it by its fixtures e.g. in memories and chases
  - On tap button (like memories)
  - Search box
- Map
  - Change size
  - Turn around by 180°
- Speed/Fade control
  - Global vs local speed
  - Global pause/halt
  - Global fading (outgoing universe)
- Prepare changes before applying
  - Chases, Memories, Fixture states...
  - Fade/transition
  - Kick off multiple changes at once
- Fixture Selection
  - Select by mapping (e.g. all color fixtures)
- Memories
  - Button instead of fader, or fader only
  - In a row: repeat n times
  - Alternating: alternate after n fixtures
  - Apply by map coordinates instead of member order
  - Preset library
- Chases
  - Apply same state to all fixtures
  - Color distribution: random, equal, relative
- Dynamic Pages
  - MultiSelect input should be unique for multi-ID widgets
  - MultiSelect input should be sortable
  - Multi-control widgets
- New Controls
  - Programmable buttons
  - Non-live chases
  - Sequences/shows
- Inputs
  - Custom keybindings
  - LaunchPad input
  - XTouch input
  - External input mapping

## Tech

- React Router scroll restoration
- Backend restructuring
  - easier masterData extension / new entity process?
- Simplify / remove frontend API worker?
- Node.js worker threads
