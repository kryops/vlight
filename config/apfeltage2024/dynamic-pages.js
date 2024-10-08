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
                type: 'controls',
              },
              {
                type: 'fixture-group',
                id: '1',
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
    icon: 'mdiApple',
    name: 'Apfel',
    headline: 'Apfeltage',
  },
]

module.exports = dynamicPages
