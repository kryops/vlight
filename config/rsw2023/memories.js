const memories = [
  {
    id: '1',
    name: '9e',
    scenes: [
      {
        members: ['group:7'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 255,
                b: 0,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '2',
    name: '10a',
    scenes: [
      {
        members: ['group:7'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 152,
              b: 255,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 147,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '3',
    name: '10b',
    scenes: [
      {
        members: ['group:7'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 255,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 0,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '4',
    name: '10c',
    scenes: [
      {
        members: ['group:7'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 0,
                g: 255,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 0,
                b: 255,
              },
            },
          ],
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 255,
              },
            },
          ],
        ],
        pattern: 'alternate',
      },
    ],
  },
]

module.exports = memories
