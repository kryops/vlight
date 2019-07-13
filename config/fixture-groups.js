/** @type {import('../shared/types/entities').FixtureGroup[]} */
const fixtureGroups = [
  // {
  //   id: 'test',
  //   name: 'Test',
  //   fixtures: ['rgb', 'rgbwauv'],
  // },
  // {
  //   id: 'multi',
  //   fixtures: ['rgb1', 'rgb2', 'rgb3', 'rgb4'],
  // },
  // {
  //   id: 'multi2',
  //   fixtures: ['rgb2', 'rgb3'],
  // },
  {
    id: 'stufen',
    name: 'Stufen',
    fixtures: ['stufe1', 'stufe2', 'stufe3', 'stufe4'],
  },
  {
    id: 'floor3x12',
    name: 'Floor 3x12',
    fixtures: [
      '3x12-1',
      '3x12-2',
      '3x12-3',
      '3x12-4',
      '3x12-5',
      '3x12-6',
      '3x12-7',
      '3x12-8',
    ],
  },
  {
    id: '12x12',
    name: '12x12',
    fixtures: [
      '12x12-1',
      '12x12-2',
      '12x12-3',
      '12x12-4',
      '12x12-5',
      '12x12-6',
      '12x12-7',
      '12x12-8',
    ],
  },
  {
    id: 'blinder',
    name: 'Blinder',
    fixtures: ['blinder1', 'blinder2'],
  },
  {
    id: 'bars',
    name: 'Bars',
    fixtures: ['bar1', 'bar2'],
  },
  {
    id: 'flach',
    name: 'Flach alle',
    fixtures: ['flach1', 'flach2', 'flach3', 'flach4'],
  },
  {
    id: 'flach-key',
    name: 'Flach Keyboard',
    fixtures: ['flach1', 'flach2'],
  },
  {
    id: 'flach-lead',
    name: 'Flach Lead',
    fixtures: ['flach3', 'flach4'],
  },
]

module.exports = fixtureGroups
