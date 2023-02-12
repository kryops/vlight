const memories = [
  {
    id: '10',
    name: 'Bühne',
    scenes: [
      {
        members: ['all:7', 'all:15'],
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
        ],
      },
    ],
  },
  {
    id: '20',
    name: 'Bütt',
    scenes: [
      {
        members: ['group:13'],
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
        ],
      },
    ],
  },
  {
    id: '11',
    name: 'Gang',
    scenes: [
      {
        members: ['group:2'],
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
        ],
      },
    ],
  },
  {
    id: '19',
    name: 'Kalt/warm',
    scenes: [
      {
        members: ['group:12'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
              w: 255,
              ww: 255,
            },
          },
        ],
      },
    ],
  },
  {
    id: '13',
    name: 'Blinder Eff',
    scenes: [
      {
        members: ['group:4'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 0,
              eff: 7,
            },
          },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'Blinder',
    scenes: [
      {
        members: ['group:4'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
              fla: 0,
              w: 255,
              eff: 12,
            },
          },
        ],
      },
    ],
  },
  {
    id: '1',
    name: 'Strobo',
    scenes: [
      {
        members: [
          'group:1',
          'group:2',
          'group:8',
          'group:9',
          'group:10',
          'group:4',
          'group:6',
          'type:3',
          'group:5',
          'group:7',
        ],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              str: 255,
              shutter: 208,
            },
          },
        ],
      },
    ],
  },
  {
    id: '7',
    name: 'Farben',
    scenes: [
      {
        members: ['group:8', 'group:9', 'group:10'],
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
              r: 0,
              g: 255,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 255,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
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
  {
    id: '2',
    name: 'Rainbow',
    scenes: [
      {
        members: ['group:9', 'group:10'],
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
                g: 255,
                b: 255,
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
      },
    ],
  },
]

module.exports = memories
