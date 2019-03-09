/** @type {import('../shared/types/entities').FixtureType[]} */
const fixtureTypes = [
  {
    id: 'generic',
    name: 'Generic',
    mapping: ['m'],
  },
  {
    id: 'rgb',
    name: 'RGB',
    mapping: ['r', 'g', 'b'],
  },
  {
    id: 'rgbwauv',
    name: 'RGBWAUV',
    mapping: ['r', 'g', 'b', 'w', 'a', 'uv'],
  },
]

module.exports = fixtureTypes
