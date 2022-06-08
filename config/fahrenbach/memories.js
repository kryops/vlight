const memories = [
  {
    id: 'test',
    name: 'Bunt',
    scenes: [
      {
        members: ['type:flach'],
        states: [
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
              g: 0,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
      {
        members: ['all:1'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: '1',
    name: 'Stufen',
    scenes: [
      {
        members: ['group:stufen'],
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
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '2',
    name: 'Strobe 20',
    scenes: [
      {
        members: ['group:4'],
        states: [
          {
            on: true,
            channels: {
              m: 243,
              r: 0,
              g: 0,
              b: 0,
              str: 255,
            },
          },
        ],
      },
    ],
  },
]

module.exports = memories
