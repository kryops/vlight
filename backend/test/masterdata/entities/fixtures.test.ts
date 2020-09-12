import { Fixture } from '@vlight/entities'

import { fillMasterDataEntity } from '../../../src/services/masterdata'
import { processFixtures } from '../../../src/services/masterdata/entities/fixtures'

import { fixtureTypes } from './mocks'

describe('processFixtures', () => {
  beforeAll(() => {
    fillMasterDataEntity('fixtureTypes', fixtureTypes)
  })

  it('just returns single fixtures', () => {
    const fixtures: Fixture[] = [
      {
        id: 'foo',
        type: 'bar',
        channel: 1,
      },
    ]
    expect(processFixtures(fixtures)).toEqual(fixtures)
  })

  it('handles multi fixtures', () => {
    const fixtures: Fixture[] = [
      {
        id: 'foo',
        type: 'bar',
        name: 'Foo #',
        channel: 1,
        count: 3,
      },
    ]
    expect(processFixtures(fixtures)).toEqual([
      {
        id: 'foo_1',
        type: 'bar',
        name: 'Foo 1',
        channel: 1,
        originalId: 'foo',
      },
      {
        id: 'foo_2',
        type: 'bar',
        name: 'Foo 2',
        channel: 4,
        originalId: 'foo',
      },
      {
        id: 'foo_3',
        type: 'bar',
        name: 'Foo 3',
        channel: 7,
        originalId: 'foo',
      },
    ])
  })
})
