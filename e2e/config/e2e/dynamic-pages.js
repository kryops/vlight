const dynamicPages = [
  {
    id: '1',
    headline: 'Show',
    rows: [
      {
        headline: 'Controls',
        widgets: [
          { type: 'dmx-master' },
          { type: 'buttons', ids: ['1'] },
          { type: 'memory', id: '1' },
        ],
      },
    ],
  },
]

module.exports = dynamicPages
