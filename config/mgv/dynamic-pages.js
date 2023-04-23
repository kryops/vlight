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
                id: ['1', '9', '13', '11'],
                mapping: ['m'],
              },
              {
                type: 'memory',
                id: '1',
              },
              {
                type: 'fixture-group',
                id: ['5'],
                mapping: ['m', 'r', 'g', 'b'],
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
                id: ['6', '7', '8'],
                mapping: ['m', 'r', 'g', 'b'],
              },
              {
                type: 'fixture-group',
                id: ['12', '10'],
                mapping: ['m'],
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
                id: ['2'],
                mapping: ['m', 'r', 'g', 'b'],
              },
              {
                type: 'live-memory',
                id: ['2', '1'],
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
