const memories = [
  {
    id: '1',
    name: 'RGB',
    display: 'both',
    scenes: [
      {
        members: ['group:2'],
        states: [
          [
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
                g: 183,
                b: 0,
              },
              mirrored: false,
            },
          ],
          [
            {
              channels: {
                m: 255,
                r: 0,
                g: 255,
                b: 255,
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
          ],
        ],
        order: 'members',
        pattern: 'alternate',
      },
    ],
  },
]

module.exports = memories
