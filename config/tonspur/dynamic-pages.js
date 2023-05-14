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
                id: ['1', '9', '4', '7', '10', '8'],
                mapping: ['m'],
              },
              {
                type: 'memory',
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
                id: ['2'],
                mapping: ['m', 'r', 'g', 'b'],
              },
              {
                type: 'live-memory',
                id: ['1', '2', '3'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Tonspur',
    headline: 'Tonspur 2023',
    icon: 'mdiMusicClefTreble',
  },
  {
    id: '2',
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'live-chase',
                id: ['1', '2'],
              },
              {
                type: 'controls',
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
                id: ['3'],
              },
              {
                type: 'memory',
                id: ['2'],
              },
              {
                type: 'fixture-group',
                id: ['3'],
                mapping: ['m', 'r', 'g', 'b', 'w', 'a', 'uv', 'pan', 'tilt'],
              },
            ],
          },
        ],
      },
    ],
    name: 'Aftershow-Party',
    headline: 'Aftershow-Party',
    icon: 'mdiPartyPopper',
  },
]

module.exports = dynamicPages
