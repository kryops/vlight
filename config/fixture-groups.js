// @ts-check
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
    fixtures: ['stufe#'],
  },
  {
    id: 'floor3x12',
    name: 'Floor 3x12',
    fixtures: ['3x12-#'],
  },
  {
    id: '12x12',
    name: '12x12',
    fixtures: ['12x12-1#'],
  },
  {
    id: 'blinder',
    name: 'Blinder',
    fixtures: ['blinder#'],
  },
  {
    id: 'bars',
    name: 'Bars',
    fixtures: ['bar#'],
  },
  {
    id: 'flach',
    name: 'Flach alle',
    fixtures: ['flach#'],
  },
  {
    id: 'flach-key',
    name: 'Flach Keyboard',
    fixtures: ['flach#'],
  },
  {
    id: 'flach-lead',
    name: 'Flach Lead',
    fixtures: ['flach#'],
  },
]

module.exports = fixtureGroups
