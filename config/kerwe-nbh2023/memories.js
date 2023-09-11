const memories = [
  {
    id: '2',
    name: 'Stu',
    display: 'fader',
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
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '3',
    name: 'Bar',
    display: 'fader',
    scenes: [
      {
        members: ['group:5'],
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
        order: 'members',
      },
    ],
  },
  {
    id: '1',
    name: 'Bli',
    display: 'flash',
    scenes: [
      {
        members: ['group:3'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 0,
              w: 255,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '4',
    name: 'MP',
    display: 'toggle',
    scenes: [
      {
        members: ['group:2'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 0,
              pan: 136,
              tilt: 136,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '5',
    name: 'MW',
    display: 'toggle',
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
              w: 255,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '6',
    name: 'Bunt',
    display: 'fader',
    scenes: [
      {
        members: ['group:6'],
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
                g: 255,
                b: 0,
              },
              mirrored: true,
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
              mirrored: true,
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
