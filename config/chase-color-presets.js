const chaseColorPresets = [
  {
    id: '1',
    name: 'full',
    colors: [
      {
        channels: {
          m: 255,
          r: [0, 255],
          g: [0, 255],
          b: [0, 255],
        },
      },
    ],
  },
  {
    id: '2',
    name: 'range',
    colors: [
      {
        channels: {
          m: 255,
          r: {
            from: 0,
            to: 255,
          },
          g: {
            from: 0,
            to: 255,
          },
          b: {
            from: 0,
            to: 255,
          },
        },
      },
    ],
  },
  {
    id: '5',
    name: '(all w)',
    colors: [
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
          b: 255,
          w: 255,
        },
      },
    ],
  },
  {
    id: '6',
    name: '-',
    colors: [
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
          w: 0,
        },
      },
    ],
  },
  {
    id: '7',
    name: '-',
    colors: [
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
          r: 0,
          g: 255,
          b: 0,
          w: 0,
        },
      },
    ],
  },
  {
    id: '8',
    name: '',
    colors: [
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
          g: 255,
          b: 0,
          w: 0,
        },
      },
    ],
  },
  {
    id: '9',
    name: '',
    colors: [
      {
        channels: {
          m: 255,
          r: 255,
          g: {
            from: 0,
            to: 255,
          },
          b: 0,
        },
      },
      {
        channels: {
          m: 255,
          r: 0,
          g: {
            from: 0,
            to: 255,
          },
          b: 255,
          w: 0,
        },
      },
    ],
  },
  {
    id: '10',
    name: '',
    colors: [
      {
        channels: {
          m: 255,
          r: [0, 255],
          g: [0, 255],
          b: 0,
        },
      },
      {
        channels: {
          m: 255,
          r: 0,
          g: [0, 255],
          b: [0, 255],
        },
      },
      {
        channels: {
          m: 255,
          r: [0, 255],
          b: [0, 255],
        },
      },
    ],
  },
  {
    id: '11',
    name: '',
    colors: [
      {
        channels: {
          m: 255,
          r: 0,
          g: 255,
          b: {
            from: 0,
            to: 255,
          },
        },
      },
      {
        channels: {
          m: 255,
          r: 255,
          b: 0,
          g: {
            from: 0,
            to: 255,
          },
        },
      },
    ],
  },
  {
    id: '12',
    name: '',
    colors: [
      {
        channels: {
          m: 0,
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ],
  },
  {
    id: '13',
    name: 'm',
    colors: [
      {
        channels: {
          m: 255,
          r: 0,
          g: 0,
          b: 0,
          col: 0,
        },
      },
    ],
  },
  {
    id: '14',
    name: 'col',
    colors: [
      {
        channels: {
          m: 255,
          r: 0,
          g: 0,
          b: 0,
          col: {
            from: 0,
            to: 255,
          },
        },
      },
    ],
  },
  {
    id: '15',
    name: 'g/p',
    colors: [
      {
        channels: {
          m: 255,
          r: 0,
          g: 0,
          b: 0,
          col: 0,
          gobo: {
            from: 0,
            to: 255,
          },
          prism: {
            from: 0,
            to: 255,
          },
        },
      },
    ],
  },
  {
    id: '16',
    name: '',
    colors: [
      {
        channels: {
          m: 255,
          r: 0,
          g: {
            from: 0,
            to: 255,
          },
          b: 255,
        },
      },
    ],
  },
  {
    id: '17',
    name: 'pos',
    colors: [
      {
        channels: {
          m: 0,
          r: 0,
          pan: {
            from: 45,
            to: 155,
          },
          tilt: {
            from: 10,
            to: 111,
          },
        },
      },
    ],
  },
  {
    id: '18',
    name: 'tilt',
    colors: [
      {
        channels: {
          m: 0,
          r: 0,
          pan: 0,
          tilt: {
            from: 130,
            to: 255,
          },
        },
      },
    ],
  },
]

module.exports = chaseColorPresets
