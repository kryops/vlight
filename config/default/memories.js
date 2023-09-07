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
    display: 'both',
  },
  {
    id: '1',
    name: 'Fader',
    display: 'fader',
    scenes: [
      {
        members: ['stufe_2'],
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
    id: '2',
    name: 'Flash',
    display: 'flash',
    scenes: [
      {
        members: ['stufe_3'],
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
    id: '3',
    name: 'Toggle',
    display: 'toggle',
    scenes: [
      {
        members: ['stufe_4'],
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
]

module.exports = memories
