/** @type {import('../shared/types/entities').FixtureGroup[]} */
const fixtureGroups = [
  {
    id: 'test',
    name: 'Test',
    fixtures: ['rgb', 'rgbwauv'],
  },
  {
    id: 'multi',
    fixtures: ['rgb1', 'rgb2', 'rgb3', 'rgb4'],
  },
  {
    id: 'multi2',
    fixtures: ['rgb2', 'rgb3'],
  },
]

module.exports = fixtureGroups
