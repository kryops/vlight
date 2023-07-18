const dynamicPages = [
  {
    id: '1',
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'dmx-master',
              },
              {
                type: 'fixture-group',
                id: ['4', '6', '5'],
                mapping: ['m'],
              },
              {
                type: 'live-memory',
                id: ['1', '2'],
              },
            ],
          },
        ],
      },
      {
        cells: [
          {
            widgets: [
              {
                type: 'live-chase',
                id: ['1', '2'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Waibstadt1',
    icon: 'mdiCat',
    headline: 'RSW2023',
  },
]

module.exports = dynamicPages
