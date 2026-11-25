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
]

module.exports = fixtureTypes
