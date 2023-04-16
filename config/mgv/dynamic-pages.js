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
                type: 'live-memory',
                id: ['1', '2'],
              },
              {
                type: 'live-chase',
                id: '1',
              },
            ],
          },
        ],
      },
    ],
    name: 'MGV 2023',
    icon: 'mdiAccountTieVoice',
    headline: 'MGV 2023',
  },
]

module.exports = dynamicPages
