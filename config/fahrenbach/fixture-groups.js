const fixtureGroups = [
  {
    id: 'stufen',
    name: 'Stufen',
    fixtures: ['all:stufe'],
  },
  {
    id: 'blinder',
    name: 'Blinder',
    fixtures: ['all:blinder'],
  },
  {
    id: 'bars',
    name: 'Bars',
    fixtures: ['all:bar'],
  },
  {
    id: 'flach',
    name: 'Flach alle',
    fixtures: ['all:3', 'all:4'],
  },
  {
    id: '1',
    name: '8x30',
    fixtures: ['all:1', 'all:2'],
  },
  {
    id: '2',
    name: 'Washer',
    fixtures: ['all:5'],
  },
  {
    id: '3',
    name: 'All',
    fixtures: [
      'all:stufe',
      'all:blinder',
      'all:bar',
      'all:1',
      'all:2',
      'all:3',
      'all:4',
      'all:5',
    ],
  },
  {
    id: '4',
    name: 'Color',
    fixtures: [
      'all:blinder',
      'all:bar',
      'all:1',
      'all:2',
      'all:3',
      'all:4',
      'all:5',
    ],
  },
]

module.exports = fixtureGroups
