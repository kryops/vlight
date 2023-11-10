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
                id: ['2', '16', '6'],
              },
              {
                type: 'live-chase',
                id: '1',
              },
              {
                type: 'memory',
                id: ['10', '14'],
              },
              {
                type: 'live-memory',
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
                id: ['4', '13', '7', '15', '12', '11', '8'],
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
                id: ['3', '4', '2'],
              },
            ],
          },
        ],
      },
    ],
    name: 'CCB Jubiläum',
    icon: 'mdiPartyPopper',
    headline: 'CCB Jubiläum',
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
                type: 'memory',
                id: ['2', '6'],
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
                id: '1',
              },
            ],
          },
        ],
      },
    ],
    name: 'Buntes Programm',
    icon: 'mdiLooks',
    headline: 'Buntes Programm',
  },
]

module.exports = dynamicPages
