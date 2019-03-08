/** @type {import('../shared/types/entities').FixtureType[]} */
const fixtureTypes = [
  {
    id: 1,
    name: 'Generic',
    mapping: ['m'],
  },
  {
    id: 2,
    name: 'RGB',
    mapping: ['r', 'g', 'b'],
  },
  {
    id: 3,
    name: 'RGBWAUV',
    mapping: ['r', 'g', 'b', 'w', 'a', 'uv'],
  },
]

module.exports = fixtureTypes
