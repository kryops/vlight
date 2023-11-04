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
                id: ['2', '3', '10', '14'],
              },
              {
                type: 'live-chase',
                id: '1',
              },
              {
                type: 'fixture-group',
                id: ['8'],
                mapping: ['m', 'rot', 'eff', 'effspeed'],
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
                id: ['4', '13', '5', '7', '12', '11', '1', '8'],
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
                id: ['2', '3', '4'],
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
  {
    id: '2',
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
                type: 'memory',
                id: ['10'],
              },
              {
                type: 'fixture-group',
                id: ['7'],
                mapping: ['col', 'gobo', 'prism', 'macro'],
              },
              {
                type: 'fixture-group',
                id: ['8'],
                mapping: ['rot', 'eff', 'effspeed'],
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
                id: ['3', '4'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Movings',
    icon: 'mdiCat',
    headline: 'Movings',
  },
]

module.exports = dynamicPages
