const dynamicPages = [
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
                id: ['10', '20', '11', '19'],
              },
              {
                type: 'fixture',
                id: ['22_1', '22_2'],
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
                type: 'live-memory',
                id: ['1', '2'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Farben',
    headline: 'Farben',
    icon: 'mdiPartyPopper',
  },
  {
    id: '1',
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'memory',
                id: ['1'],
              },
              {
                type: 'live-chase',
                id: ['2'],
              },
              {
                type: 'memory',
                id: ['13', '6'],
              },
              {
                type: 'live-chase',
                id: ['5'],
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
                type: 'fixture',
                id: ['23'],
              },
              {
                type: 'memory',
                id: ['12'],
              },
            ],
          },
        ],
      },
    ],
    icon: 'mdiFlash',
    name: 'Effects',
    headline: 'Effects',
  },
  {
    id: 'dyn1',
    icon: 'mdiCursorMove',
    headline: 'Movings',
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'fixture-group',
                id: ['14'],
                mapping: [
                  'm',
                  'shutter',
                  'pan',
                  'tilt',
                  'mvspeed',
                  'col',
                  'gobo',
                  'goboshake',
                  'prism',
                  'prismrot',
                ],
              },
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
  },
]

module.exports = dynamicPages
