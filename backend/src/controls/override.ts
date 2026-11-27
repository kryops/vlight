import {
  ChannelType,
  getFixtureTypeSegments,
  resolveMember,
} from '@vlight/controls'
import { Fixture, FixtureType } from '@vlight/types'

import { masterData, masterDataMaps } from '../services/masterdata'
import { createUniverse, Universe } from '../services/universe'
import { getUniverseIndex } from '../services/universe/utils'

/**
 * The channels of a fixture that a control overrides:
 * - `look`: all channels except the position channels
 * - `position`: only the position channels (pan/tilt)
 * - `full`: all channels
 */
export type OverrideScope = 'look' | 'position' | 'full'

const positionChannelTypes = new Set<string>([
  ChannelType.Pan,
  ChannelType.PanFine,
  ChannelType.Tilt,
  ChannelType.TiltFine,
])

/**
 * Determines the override scope from the channel types that a control sets:
 * - only position channels: `position`
 * - both position and other channels: `full`
 * - otherwise: `look`
 */
export function getOverrideScope(
  channelTypes: Iterable<string>
): OverrideScope {
  let position = false
  let look = false
  for (const channelType of channelTypes) {
    if (positionChannelTypes.has(channelType)) position = true
    else look = true
  }
  if (position) return look ? 'full' : 'position'
  return 'look'
}

function isInScope(channelType: string, scope: OverrideScope) {
  if (scope === 'full') return true
  return positionChannelTypes.has(channelType) === (scope === 'position')
}

function writeFixtureWeights(
  weights: Universe,
  fixture: Fixture,
  fixtureType: FixtureType,
  scope: OverrideScope,
  segmentIndex?: number
) {
  const segments =
    segmentIndex === undefined ? undefined : getFixtureTypeSegments(fixtureType)
  const baseIndex = getUniverseIndex(fixture.channel)

  fixtureType.mapping.forEach((channelType, offset) => {
    if (!isInScope(channelType, scope)) return
    // segments also override the channels shared between all segments
    const segment = segments?.segmentByMappingIndex[offset]
    if (segment !== undefined && segment !== segmentIndex) return
    weights[baseIndex + offset] = 255
  })
}

/**
 * Creates a weights universe that fully overrides the given scope of the given members.
 *
 * Members may also be segments (`foobar@2`), which override their own channels
 * and the channels shared between all segments.
 */
export function createOverrideWeights(
  members: Iterable<string>,
  scope: OverrideScope
): Universe {
  const weights = createUniverse()
  for (const member of members) {
    const resolved = resolveMember(member, masterDataMaps)
    if (!resolved) continue
    writeFixtureWeights(
      weights,
      resolved.fixture,
      resolved.fixtureType,
      scope,
      resolved.segmentIndex
    )
  }
  return weights
}

/**
 * Adds the given scope of all fixtures to the given weights universe.
 */
export function addAllFixturesToOverrideWeights(
  weights: Universe,
  scope: OverrideScope
): void {
  for (const fixture of masterData.fixtures) {
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (fixtureType) writeFixtureWeights(weights, fixture, fixtureType, scope)
  }
}
