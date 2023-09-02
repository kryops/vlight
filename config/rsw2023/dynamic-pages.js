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
                id: ['4', '5', '8'],
                mapping: ['m'],
              },
              {
                type: 'memory',
                id: ['1', '3', '2', '4'],
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
                type: 'live-memory',
                id: ['1', '2'],
              },
              {
                type: 'live-chase',
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
                type: 'fixture-group',
                id: ['10'],
                mapping: ['m'],
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
