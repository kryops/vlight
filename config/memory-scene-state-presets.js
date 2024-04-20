const memorySceneStatePresets = [
  {
    id: '1',
    name: 'rain',
    state: [
      {
        channels: {
          m: 255,
          r: 255,
          g: 0,
          b: 0,
        },
        mirrored: false,
      },
      {
        channels: {
          m: 255,
          r: 255,
          g: 255,
          b: 0,
        },
        mirrored: false,
      },
      {
        channels: {
          m: 255,
          r: 0,
          g: 255,
          b: 0,
        },
        mirrored: false,
      },
      {
        channels: {
          m: 255,
          r: 0,
          g: 0,
          b: 255,
        },
        mirrored: false,
      },
      {
        channels: {
          m: 255,
          r: 255,
          g: 0,
          b: 1,
        },
        mirrored: false,
      },
    ],
  },
  {
    id: '3',
    name: 'blue',
    state: [
      {
        channels: {
          m: 255,
          r: 0,
          g: 0,
          b: 255,
        },
        mirrored: true,
      },
      {
        channels: {
          m: 255,
          r: 0,
          g: 255,
          b: 255,
        },
        mirrored: true,
      },
    ],
  },
  {
    id: '4',
    name: 'fire',
    state: [
      {
        channels: {
          m: 255,
          r: 255,
          g: 0,
          b: 0,
        },
        mirrored: true,
      },
      {
        channels: {
          m: 255,
          r: 255,
          g: 200,
          b: 0,
        },
        mirrored: true,
      },
    ],
  },
  {
    id: '5',
    name: 'beam',
    state: [
      {
        channels: {
          m: 0,
          r: 255,
          g: 255,
          b: 255,
        },
        mirrored: true,
        position: 60,
      },
      {
        channels: {
          m: 255,
          r: 255,
          g: 255,
          b: 255,
        },
        mirrored: true,
      },
    ],
  },
  {
    id: '6',
    name: 'tilt',
    state: [
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 83,
        },
        mirrored: true,
      },
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 177,
        },
        mirrored: true,
      },
    ],
  },
  {
    id: '7',
    name: 'square',
    state: [
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 83,
          pan: 81,
        },
      },
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 162,
          pan: 81,
        },
      },
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 162,
          pan: 161,
        },
      },
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 83,
          pan: 161,
        },
      },
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
          tilt: 83,
          pan: 79,
        },
      },
    ],
  },
]

module.exports = memorySceneStatePresets
