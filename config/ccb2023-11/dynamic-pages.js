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
                id: ['4', '13', '7', '15', '12', '11', '8', '18'],
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
              {
                type: 'live-memory',
                id: ['2'],
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
                id: ['19', '2', '16', '6'],
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
              {
                type: 'memory',
                id: ['18', '7', '11', '8'],
              },
              {
                type: 'live-chase',
                id: ['2'],
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
  {
    id: '3',
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'controls',
              },
              {
                type: 'memory',
                id: ['4', '13', '7', '15', '12', '11', '8', '18'],
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
      {
        cells: [
          {
            widgets: [
              {
                type: 'memory',
                id: ['10', '14'],
              },
              {
                type: 'memory',
                id: ['17'],
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
