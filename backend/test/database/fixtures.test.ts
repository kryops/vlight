import { FixtureType } from '@vlight/entities'

import { processFixtures } from '../../src/database/fixtures'
import { fillEntity } from '../../src/database'

describe('processFixtures', () => {
  beforeAll(() => {
    const fixtureTypes: FixtureType[] = [
      {
        id: 'bar',
        name: 'Bar',
        mapping: ['r', 'g', 'b'],
      },
    ]
    fillEntity('fixtureTypes', fixtureTypes)
  })

  it('just returns single fixtures', () => {
    const fixtures = [
      {
        id: 'foo',
        type: 'bar',
        channel: 1,
      },
    ]
    expect(processFixtures(fixtures)).toEqual(fixtures)
  })

  it('just returns single fixtures', () => {
    const fixtures = [
      {
        id: 'foo',
        type: 'bar',
        channel: 1,
      },
    ]
    expect(processFixtures(fixtures)).toEqual(fixtures)
  })

  it('handles multi fixtures', () => {
    const fixtures = [
      {
        id: 'foo#',
        type: 'bar',
        name: 'Foo #',
        channel: 1,
        count: 3,
      },
    ]
    expect(processFixtures(fixtures)).toEqual([
      {
        id: 'foo1',
        type: 'bar',
        name: 'Foo 1',
        channel: 1,
      },
      {
        id: 'foo2',
        type: 'bar',
        name: 'Foo 2',
        channel: 4,
      },
      {
        id: 'foo3',
        type: 'bar',
        name: 'Foo 3',
        channel: 7,
      },
    ])
  })
})
