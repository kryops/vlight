// @ts-check
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
  {
    id: 'wasserdicht9',
    name: 'Wasserdicht 9ch',
    mapping: ['m', 'r', 'g', 'b', 'a', 'w', 'uv', 'str', 'cur'],
  },
  {
    id: 'blinder19',
    name: 'Blinder 19ch',
    mapping: [
      'eff',
      'm',
      'fla',
      'r',
      'g',
      'b',
      'w',
      'r',
      'g',
      'b',
      'w',
      'r',
      'g',
      'b',
      'w',
      'r',
      'g',
      'b',
      'w',
    ],
  },
  {
    id: 'bar15',
    name: 'Bar 15ch',
    mapping: [
      'eff',
      'm',
      'str',
      'r',
      'g',
      'b',
      'r',
      'g',
      'b',
      'r',
      'g',
      'b',
      'r',
      'g',
      'b',
    ],
  },
  {
    id: 'flach',
    name: 'Flach',
    mapping: ['m', 'r', 'g', 'b', 'fn', 'str'],
  },
  {
    id: 'stufe3',
    name: 'Stufenlinse 3ch',
    mapping: ['m', 'str', 'cur'],
  },
  {
    id: 'hazer',
    name: 'Hazer',
    mapping: ['m', 'fan'],
  },
]

module.exports = fixtureTypes
