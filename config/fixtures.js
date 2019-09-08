// @ts-check
/** @type {import('../shared/types/entities').Fixture[]} */
const fixtures = [
  // {
  //   id: 'gen',
  //   type: 'generic',
  //   channel: 1,
  // },
  // {
  //   id: 'rgb',
  //   type: 'rgb',
  //   channel: 2,
  // },
  // {
  //   id: 'rgbwauv',
  //   type: 'rgbwauv',
  //   channel: 5,
  // },
  // {
  //   id: 'rgb#',
  //   name: 'RGB Multi #',
  //   type: 'rgb',
  //   channel: 11,
  //   count: 4,
  // },
  {
    id: 'stufe#',
    name: 'Stufe #',
    type: 'stufe3',
    channel: 1,
    count: 4,
  },
  {
    id: '3x12-#',
    name: 'Floor 3x12 #',
    type: 'wasserdicht9',
    channel: 25,
    count: 8,
  },
  {
    id: '12x12-#',
    name: '12x12 #',
    type: 'wasserdicht9',
    channel: 97,
    count: 8,
  },
  {
    id: 'blinder#',
    name: 'Blinder #',
    type: 'blinder19',
    channel: 169,
    count: 2,
  },
  {
    id: 'bar#',
    name: 'Bar # (Drum)',
    type: 'bar15',
    channel: 207,
    count: 2,
  },
  {
    id: 'flach#',
    name: 'Flach #',
    type: 'flach',
    channel: 237,
    count: 4,
  },
  {
    id: 'hazer',
    name: 'Hazer',
    type: 'hazer',
    channel: 439,
  },
]

module.exports = fixtures
