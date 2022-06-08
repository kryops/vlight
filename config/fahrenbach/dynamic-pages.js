const dynamicPages = [
  {
    id: 'dyn1',
    icon: 'mdiAirballoon',
    headline: 'Foobar2',
    rows: [
      {
        headline: 'universe',
        cells: [
          {
            widgets: [
              {
                type: 'universe',
                from: 1,
                to: 8,
                title: 'UNI',
              },
              {
                type: 'universe',
                from: 9,
                to: 20,
              },
            ],
          },
          {
            widgets: [
              {
                type: 'channels',
                from: 1,
                to: 8,
              },
            ],
          },
          {
            widgets: [
              {
                type: 'memory',
                id: '1',
              },
            ],
          },
        ],
      },
      {
        headline: 'bla',
        cells: [
          {
            widgets: [
              {
                type: 'fixture',
                id: 'bar1',
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
          {
            factor: 2,
            widgets: [
              {
                type: 'fixture-group',
                id: 'stufen',
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
                id: '1',
              },
            ],
          },
          {
            widgets: [
              {
                type: 'live-chase',
                id: '1',
              },
            ],
          },
        ],
        headline: 'Test',
      },
    ],
    name: 'Test Dynamic Page',
  },
  {
    id: '1',
    rows: [
      {
        cells: [
          {
            widgets: [],
          },
        ],
      },
    ],
    name: '6515616',
    icon: 'mdiAccessPointMinus',
  },
]

module.exports = dynamicPages
