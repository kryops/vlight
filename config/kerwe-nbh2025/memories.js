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
  {
    id: '9',
    name: 'Eff',
    display: 'fader',
    scenes: [
      {
        members: ['group:8'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 0,
              eff: 255,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '10',
    name: 'Spd',
    display: 'fader',
    scenes: [
      {
        members: ['group:2', 'group:7', 'group:8'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              mspeed: 0,
              mvspeed: 255,
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
        members: ['group:2', 'group:7'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 121,
              tilt: 129,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '13',
    name: 'MP2',
    display: 'toggle',
    scenes: [
      {
        members: ['group:2', 'group:7'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 80,
              tilt: 187,
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
              m: 169,
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
    id: '7',
    name: 'Spo',
    display: 'toggle',
    scenes: [
      {
        members: ['all:8'],
        states: [
          {
            on: true,
            channels: {
              m: 121,
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
    id: '12',
    name: 'Gobo',
    display: 'toggle',
    scenes: [
      {
        members: ['group:7'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 255,
              g: 255,
              b: 255,
              gobo: 58,
              prism: 163,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '14',
    name: 'Mac',
    display: 'fader',
    scenes: [
      {
        members: ['group:7'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 255,
              g: 255,
              b: 255,
              macro: 255,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '8',
    name: 'Str',
    display: 'flash',
    scenes: [
      {
        members: ['group:9'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              str: 255,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
  {
    id: '11',
    name: 'Haz',
    display: 'toggle',
    scenes: [
      {
        members: ['10'],
        states: [
          {
            on: true,
            channels: {
              m: 47,
              r: 255,
              g: 255,
              b: 255,
              fan: 111,
            },
          },
        ],
        order: 'members',
      },
    ],
  },
]

module.exports = memories
