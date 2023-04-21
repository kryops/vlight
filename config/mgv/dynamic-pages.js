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
                id: ['1'],
                mapping: [],
              },
              {
                type: 'memory',
                id: '1',
              },
              {
                type: 'fixture-group',
                id: ['2'],
                mapping: ['m', 'r', 'g', 'b', 'w'],
              },
              {
                type: 'live-memory',
                id: ['2'],
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
                id: ['1'],
              },
              {
                type: 'fixture-group',
                id: ['5', '6'],
                mapping: ['m', 'r', 'g', 'b', 'w'],
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
