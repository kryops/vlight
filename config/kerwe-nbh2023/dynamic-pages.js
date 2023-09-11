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
                type: 'memory',
                id: ['2', '3', '6'],
              },
              {
                type: 'live-memory',
                id: '1',
              },
              {
                type: 'live-chase',
                id: '1',
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
                type: 'controls',
              },
              {
                type: 'memory',
                id: ['4', '5', '1'],
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
                id: ['2', '3'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Kerwe NBH 2023',
    icon: 'mdiCastle',
    headline: 'Kerwe NBH 2023',
  },
]

module.exports = dynamicPages
