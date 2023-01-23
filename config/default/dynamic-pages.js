const dynamicPages = [
  {
    id: 'dyn1',
    headline: 'Foobar',
    rows: [
      {
        headline: 'Global',
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
                type: 'universe',
                from: 1,
                to: 8,
                title: 'Universe',
              },
            ],
          },
          {
            widgets: [
              {
                type: 'map',
              },
            ],
          },
        ],
      },
      {
        headline: 'Channels, Fixtures, Groups',
        cells: [
          {
            widgets: [
              {
                type: 'channels',
                from: 1,
                to: 4,
              },
              {
                type: 'fixture',
                id: 'bar_1',
              },
              {
                type: 'fixture-group',
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
                type: 'memory',
                id: 'test',
              },
              {
                type: 'live-memory',
                id: '2',
              },
            ],
          },
          {
            widgets: [
              {
                type: 'live-chase',
                id: ['1'],
              },
            ],
          },
        ],
        headline: 'Memories, Chases',
      },
    ],
    name: 'Test Dynamic Page',
    icon: 'mdiAirballoon',
  },
]

module.exports = dynamicPages
