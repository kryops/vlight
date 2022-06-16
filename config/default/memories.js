const memories = [
  {
    id: 'test',
    name: 'Test',
    scenes: [
      {
        members: ['type:flach'],
        pattern: 'alternate',
        states: [
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
      {
        members: ['type:rgbwauv'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
]

module.exports = memories
