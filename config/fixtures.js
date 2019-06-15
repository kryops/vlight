/** @type {import('../shared/types/entities').Fixture[]} */
const fixtures = [
  {
    id: 'gen',
    type: 'generic',
    channel: 1,
  },
  {
    id: 'rgb',
    type: 'rgb',
    channel: 2,
  },
  {
    id: 'rgbwauv',
    type: 'rgbwauv',
    channel: 5,
  },
  {
    id: 'rgb#',
    name: 'RGB Multi #',
    type: 'rgb',
    channel: 11,
    count: 4,
  },
]

module.exports = fixtures
