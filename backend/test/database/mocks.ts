import { FixtureType, Fixture, FixtureGroup, Memory } from '@vlight/entities'

export const fixtureTypes: FixtureType[] = [
  {
    id: 'foo',
    name: 'Foo',
    mapping: ['m'],
  },
  {
    id: 'bar',
    name: 'Bar',
    mapping: ['r', 'g', 'b'],
  },
  {
    id: 'baz',
    name: 'Baz',
    mapping: ['r'],
  },
]

export const fixtures: Fixture[] = [
  {
    id: 'foo1',
    name: 'Foo 1',
    type: 'foo',
    channel: 1,
  },
  {
    id: 'foo2',
    name: 'Foo 2',
    type: 'foo',
    channel: 2,
  },
  {
    id: 'bar1',
    originalId: 'bar#',
    name: 'Bar 1',
    type: 'bar',
    channel: 3,
  },
  {
    id: 'bar2',
    originalId: 'bar#',
    name: 'Bar 2',
    type: 'bar',
    channel: 6,
  },
  {
    id: 'baz1',
    name: 'Baz 1',
    type: 'baz',
    channel: 10,
  },
]

export const fixtureGroups: FixtureGroup[] = [
  {
    id: 'group1',
    name: 'Group 2',
    fixtures: ['baz1'],
  },
]

export function mockFixtureGroup(fixtures: string[]): FixtureGroup {
  return {
    id: 'g',
    name: 'G',
    fixtures,
  }
}

export function mockMemory(sceneMembers: string[][]): Memory {
  return {
    id: 'm',
    scenes: sceneMembers.map(members => ({
      members,
      state: {
        on: true,
        channels: { m: 255, r: 255 },
      },
    })),
  }
}
