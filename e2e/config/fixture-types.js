const fixtureTypes = [
  {
    id: 'dimmer',
    name: 'Dimmer',
    mapping: ['m'],
    shape: 'circle',
    border: 'dashed',
  },
  {
    id: 'rgbm',
    name: 'RGB Par',
    mapping: ['m', 'r', 'g', 'b'],
    shape: 'circle',
    border: 'solid',
  },
  {
    id: 'movinghead',
    name: 'Moving Head',
    mapping: ['pan', 'tilt', 'm', 'r', 'g', 'b'],
    shape: 'square',
    border: 'solid',
  },
  {
    id: 'mover',
    name: 'Mover (no master)',
    mapping: ['pan', 'r', 'g'],
    shape: 'square',
    border: 'dotted',
  },
  {
    id: 'bar3',
    name: 'LED Bar (3 segments)',
    mapping: ['m', 'r', 'g', 'b', 'r', 'g', 'b', 'r', 'g', 'b'],
    shape: 'square',
    border: 'solid',
    xSize: 9,
    ySize: 3,
  },
]

module.exports = fixtureTypes
