import {
  DynamicPage,
  Fixture,
  FixtureGroup,
  FixtureType,
  Memory,
} from '@vlight/types'
import { ChannelType } from '@vlight/controls'

import { apiState } from '../../../api/api-state'
import { getOccupiedFixtureChannels } from '../../../util/fixtures'
import { masterDataMaps } from '../../../api/masterdata'

type WithoutId<T> = Omit<T, 'id'>

export function newFixtureTypeFactory(): WithoutId<FixtureType> {
  return {
    name: 'New Fixture Type',
    mapping: [ChannelType.Master],
  }
}

export function newFixtureFactory(): WithoutId<Fixture> {
  const occupiedChannels =
    apiState.masterData?.fixtures.flatMap(fixture =>
      getOccupiedFixtureChannels(fixture, masterDataMaps)
    ) ?? []
  const occupiedChannelSet = new Set(occupiedChannels)

  const getGap = (channel: number) => {
    for (let i = channel + 1; i <= 512; i++) {
      if (occupiedChannelSet.has(i)) return i - channel - 1
    }
    return 512 - channel
  }
  const largestGapAfterChannel = [0, ...occupiedChannels].sort(
    (a, b) => getGap(b) - getGap(a)
  )[0]

  return {
    name: 'New Fixture',
    type: '',
    channel: largestGapAfterChannel + 1,
  }
}

export function newFixtureGroupFactory(): WithoutId<FixtureGroup> {
  return {
    name: 'New Fixture Group',
    fixtures: [],
  }
}

export function newMemoryFactory(): WithoutId<Memory> {
  return {
    name: 'New Memory',
    display: 'both',
    scenes: [
      {
        members: [],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
        ],
      },
    ],
  }
}

export function newDynamicPageFactory(): WithoutId<DynamicPage> {
  return {
    rows: [
      {
        cells: [
          {
            widgets: [
              {
                type: 'map',
              },
            ],
          },
        ],
      },
    ],
  }
}
