# TODO

## Roadmap

- Control improvements
  - Mousewheel / keyboard input for faders?
- Universe features
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
  - Rearrange channels to fix overlaps / display overlaps in overview
  - Search box
- Groups
  - On tap button (like memories)
  - Search box
- Map
  - Display all fixture names
  - Change size
- Speed/Fade control
  - Global vs local speed
  - Global pause/halt
- Prepare changes before applying
  - Chases, Memories, Fixture states...
  - Fade/transition
  - Kick off multiple changes at once
- Fixture Selection
  - Select by mapping (e.g. all color fixtures)
- Memories
  - Real-world preview during editing
  - Add fixture/group state to existing memory
  - Fade in/out buttons
  - In a row: repeat n times
  - Alternating: alternate after n fixtures
  - Preset library
- Chases
  - Color distribution: equal, relative
  - Fixture selection mode: by index, by coordinates
  - State selection mode by index
  - Persist as entities, not state?
  - Compact view: burst button only
- Dynamic Pages
  - Multi-control widgets
- New Controls
  - Movement control: Patterns, play/stop, offset per fixture, mirroring
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
