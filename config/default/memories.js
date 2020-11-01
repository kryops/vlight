const memories = [
  {
    id: 'test',
    name: 'Test',
    scenes: [
      {
        members: ['all:3x12', 'type:flach', 'group:12x12'],
        pattern: 'alternate',
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
          [
            {
              channels: {
                m: 255,
                r: 255,
              },
            },
            {
              channels: {
                m: 255,
                g: 255,
              },
            },
            {
              channels: {
                m: 255,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '1',
    name: 'New Memory',
    scenes: [
      {
        members: ['stufe_3', 'stufe_2', 'all:12x12'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 255,
              b: 10,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 1,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
]

module.exports = memories
