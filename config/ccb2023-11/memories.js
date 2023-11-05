const memories = [
  {
    id: '2',
    name: 'Stufen',
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
    id: '6',
    name: 'CCB',
    display: 'fader',
    scenes: [
      {
        members: ['group:6'],
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
              g: 0,
              b: 255,
            },
          },
        ],
        order: 'members',
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '10',
    name: 'MvSpd',
    display: 'fader',
    scenes: [
      {
        members: ['group:7'],
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
    id: '4',
    name: 'Pos1',
    display: 'toggle',
    scenes: [
      {
        members: ['group:7'],
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
    name: 'Pos2',
    display: 'toggle',
    scenes: [
      {
        members: ['group:7'],
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
    id: '7',
    name: 'Spots',
    display: 'toggle',
    scenes: [
      {
        members: ['all:8'],
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
    name: 'Macro',
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
    name: 'Strobo',
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
    name: 'Hazer',
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
