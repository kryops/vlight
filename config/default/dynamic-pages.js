const dynamicPages = [
  {
    id: 'dyn1',
    headline: 'Foobar',
    rows: [
      {
        headline: 'Global',
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
          {
            type: 'map',
          },
          {
            type: 'buttons',
            ids: ['1'],
          },
          {
            type: 'sequence',
            id: '1',
          },
        ],
      },
      {
        headline: 'Channels, Fixtures, Groups',
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
      {
        headline: 'Memories, Chases',
        widgets: [
          {
            type: 'memory',
            id: 'test',
          },
          {
            type: 'live-memory',
            id: '2',
          },
          {
            type: 'live-chase',
            id: ['1'],
          },
          {
            type: 'live-movement',
            id: '1',
          },
        ],
      },
    ],
    name: 'Test Dynamic Page',
    icon: 'mdiAirballoon',
  },
]

module.exports = dynamicPages
