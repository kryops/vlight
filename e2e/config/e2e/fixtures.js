const fixtures = [
  { id: 'dimmer', name: 'Dimmer', type: 'dimmer', channel: 1, x: 10, y: 10 },
  {
    id: 'par',
    name: 'Par #',
    type: 'rgbm',
    channel: 2,
    count: 2,
    x: 30,
    y: 10,
    xOffset: 20,
  },
  {
    id: 'mh',
    name: 'Moving Head',
    type: 'movinghead',
    channel: 10,
    x: 80,
    y: 10,
  },
  { id: 'mover', name: 'Mover', type: 'mover', channel: 30, x: 80, y: 40 },
  { id: 'bar', name: 'Bar', type: 'bar3', channel: 40, x: 50, y: 70 },
]

module.exports = fixtures
