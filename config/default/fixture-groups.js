// @ts-check
/** @type {import('@vlight/shared/types/entities').FixtureGroup[]} */
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
    fixtures: ['all:stufe'],
  },
  {
    id: 'floor3x12',
    name: 'Floor 3x12',
    fixtures: ['all:3x12'],
  },
  {
    id: '12x12',
    name: '12x12',
    fixtures: ['all:12x12'],
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
    fixtures: ['all:flach'],
  },
  {
    id: 'flach-key',
    name: 'Flach Keyboard',
    fixtures: ['all:flach'],
  },
  {
    id: 'flach-lead',
    name: 'Flach Lead',
    fixtures: ['all:flach'],
  },
]

module.exports = fixtureGroups
