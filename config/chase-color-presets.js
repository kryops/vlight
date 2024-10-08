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
    id: '3',
    name: 'r',
    colors: [
      {
        channels: {
          m: 255,
          r: 255,
          g: 0,
          b: 0,
        },
      },
    ],
  },
  {
    id: '4',
    name: 'r/w',
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
          r: 0,
          g: 0,
          b: 0,
          w: 255,
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
    name: 'b',
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
    id: '9',
    name: 'o',
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
    ],
  },
]

module.exports = chaseColorPresets
