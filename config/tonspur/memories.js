const memories = [
  {
    id: '1',
    name: 'Pos',
    scenes: [
      {
        members: ['3_1'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 148,
              tilt: 227,
              w: 0,
            },
          },
        ],
      },
      {
        members: ['3_2'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 66,
              tilt: 228,
            },
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'W',
    scenes: [
      {
        members: ['group:3'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
              w: 255,
            },
          },
        ],
      },
    ],
  },
]

module.exports = memories
