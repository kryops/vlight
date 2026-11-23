// Initial application state of the E2E project.
// Never overwritten, as the E2E server runs in read-only mode.
module.exports = {
  liveChases: {
    1: {
      name: 'Red/Blue Chase',
      on: false,
      stopped: true,
      members: ['group:1'],
      value: 255,
      light: 1,
      speed: 1,
      colors: [
        { channels: { m: 255, r: 255, g: 0, b: 0 } },
        { channels: { m: 255, r: 0, g: 0, b: 255 } },
      ],
    },
  },
  liveMemories: {
    1: {
      name: 'Green Pars',
      on: false,
      value: 255,
      members: ['group:1'],
      states: [{ on: true, channels: { m: 255, r: 0, g: 255, b: 0 } }],
    },
  },
  liveMovements: {
    1: {
      name: 'Head Circle',
      on: false,
      stopped: true,
      members: ['mh'],
      pattern: 'circle',
      center: { pan: 127, tilt: 127 },
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      offset: 0,
      speed: 1,
    },
  },
}
