const fixtureGroups = [
  {
    id: '1',
    name: 'Stufen',
    fixtures: ['all:1'],
  },
  {
    id: '4',
    name: 'F',
    fixtures: ['1_4', '1_5'],
  },
  {
    id: '2',
    name: 'Bunt',
    fixtures: [
      '3_1',
      '2_1',
      '2_2',
      '4_1',
      '5_1',
      '5_2',
      '5_3',
      '5_4',
      '4_2',
      '6_1',
      '6_2',
      '3_2',
    ],
  },
  {
    id: '3',
    name: 'Movings',
    fixtures: ['all:3'],
  },
  {
    id: '5',
    name: 'Bunt Bühne',
    fixtures: ['4_1', 'all:2', '4_2'],
  },
  {
    id: '6',
    name: 'Bunt Traverse',
    fixtures: ['3_1', 'all:5', '3_2'],
  },
]

module.exports = fixtureGroups