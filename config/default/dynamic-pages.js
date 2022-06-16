const dynamicPages = [
  {
    id: 'dyn1',
    icon: 'mdiAirballoon',
    headline: 'Foobar',
    rows: [
      {
        headline: 'Universe, Channels, Map',
        cells: [
          {
            widgets: [
              {
                type: 'universe',
                from: 1,
                to: 8,
                title: 'Universe',
              },
              {
                type: 'channels',
                from: 1,
                to: 8,
                title: 'Channels',
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
        headline: 'Fixtures, Groups, Memories',
        cells: [
          {
            widgets: [
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
          {
            widgets: [
              {
                type: 'memory',
                id: 'test',
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
                type: 'live-chase',
                id: '1',
              },
            ],
          },
        ],
        headline: 'Chases',
      },
    ],
    name: 'Test Dynamic Page',
  },
]

module.exports = dynamicPages
