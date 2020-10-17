const dynamicPages = [
  {
    id: 'dyn1',
    icon: 'mdiAirballoon',
    headline: 'Foobar',
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
          {
            widgets: [
              {
                type: 'memory',
                id: 'test',
              },
            ],
          },
        ],
      },
    ],
    name: 'Test Dynamic Page',
  },
]

module.exports = dynamicPages
