const fixtures = [
  {
    id: 'stufe',
    name: 'Stage',
    type: 'white3ch',
    channel: 1,
    count: 4,
    x: 40,
    y: 90,
    channelOffset: 4,
  },
  {
    id: '3x12',
    name: 'Floor',
    type: 'flach',
    channel: 25,
    count: 8,
    x: 9,
    y: 0,
    yOffset: 0,
    xOffset: 12,
  },
  {
    id: 'blinder',
    name: 'Blinder',
    type: 'blinder6',
    channel: 73,
    count: 2,
    x: 10,
    y: 10,
    xOffset: 80,
  },
  {
    id: 'bar',
    name: 'Bar # (Drum)',
    type: 'bar15',
    channel: 85,
    count: 2,
    x: 40,
    y: 11,
    xOffset: 20,
  },
  {
    id: '1',
    name: 'RGBWAUV',
    type: 'rgbwauv',
    channel: 115,
    count: 8,
    x: 25,
    y: 25,
  },
  {
    id: 'hazer',
    name: 'Hazer',
    type: 'hazer',
    channel: 163,
  },
  {
    id: 'movings',
    name: 'Movings',
    type: 'movingspot',
    channel: 165,
    count: 4,
    x: 8,
    y: 54,
    xOffset: 27,
  },
]

module.exports = fixtures
