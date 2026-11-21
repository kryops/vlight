const buttons = [
  {
    id: '1',
    label: 'Foo',
    down: [
      {
        type: 'live-chase',
        ids: ['1'],
        state: {
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
          speed: 0.19792297153761318,
        },
        partial: true,
        revert: true,
      },
    ],
    up: [],
    icon: 'mdiCastle',
    hotkey: 'x',
  },
]

module.exports = buttons
