import {
  Dictionary,
  Fixture,
  FixtureChannels,
  FixtureState,
  FixtureType,
  MasterDataMaps,
  MasterDataWithMaps,
} from '@vlight/types'
import { isUnique, logger } from '@vlight/utils'

import { ChannelType, FixtureMappingPrefix } from './enums'
import {
  getMasterDependentChannels,
  mapFixtureList,
  mapFixtureStateToChannels,
} from './fixtures'
import {
  getSegmentMemberId,
  parseSegmentMemberId,
  splitSegmentsPrefix,
} from './segment-ids'

type FixtureMaps = Pick<MasterDataMaps, 'fixtures' | 'fixtureTypes'>

/**
 * Channel type that is used in the mapping of a segment's virtual fixture type
 * for the channels of all other segments.
 */
export const foreignSegmentChannel = '-'

/** The default size of fixtures on the map. */
const defaultFixtureSize = 5

export interface FixtureTypeSegments {
  /** The number of segments. */
  count: number

  /**
   * The (0-based) segment index for each channel of the fixture type's mapping.
   *
   * `undefined` for channels that are shared between all segments.
   */
  segmentByMappingIndex: Array<number | undefined>

  /**
   * Whether each segment has its own master channel
   * (instead of a single master channel shared between all segments).
   */
  masterPerSegment: boolean

  /**
   * The mapping index of the master channel for each segment.
   *
   * Shared master channels are referenced by all segments.
   * Empty if the fixture type has no master channel.
   */
  masterIndexBySegment: number[]
}

const segmentsCache = new WeakMap<FixtureType, FixtureTypeSegments | null>()

/**
 * Returns the segments (multiple light sources) of the given fixture type,
 * or `undefined` if it has none.
 *
 * The channel types that appear most often (at least twice) in the mapping
 * form the segments in order of their occurrence.
 * All other channels are shared between the segments.
 *
 * The master channel is a segment channel if it appears once per segment,
 * otherwise it is shared. Fixtures with only repeated master channels
 * (e.g. dimmer packs) are split into one segment per master channel.
 */
export function getFixtureTypeSegments(
  fixtureType: FixtureType | undefined
): FixtureTypeSegments | undefined {
  if (!fixtureType || fixtureType.segments === false) return undefined

  const cached = segmentsCache.get(fixtureType)
  if (cached !== undefined) return cached ?? undefined

  const { mapping } = fixtureType
  const counts = new Map<string, number>()
  for (const channel of mapping) {
    counts.set(channel, (counts.get(channel) ?? 0) + 1)
  }
  const masterCount = counts.get(ChannelType.Master) ?? 0
  counts.delete(ChannelType.Master)
  // Master channels only define the segments if there are no other repeated channels
  const count = Math.max(0, ...counts.values()) || masterCount
  const masterPerSegment = masterCount === count
  if (masterPerSegment) counts.set(ChannelType.Master, masterCount)

  let result: FixtureTypeSegments | null = null

  if (count >= 2) {
    const occurrences = new Map<string, number>()
    const segmentByMappingIndex = mapping.map(channel => {
      if (counts.get(channel) !== count) return undefined
      const occurrence = occurrences.get(channel) ?? 0
      occurrences.set(channel, occurrence + 1)
      return occurrence
    })
    const masterIndices = mapping.flatMap((channel, index) =>
      channel === ChannelType.Master ? [index] : []
    )
    result = {
      count,
      segmentByMappingIndex,
      masterPerSegment,
      masterIndexBySegment: !masterIndices.length
        ? []
        : Array.from({ length: count }, (_, segment) =>
            masterPerSegment ? masterIndices[segment] : masterIndices[0]
          ),
    }
  }

  segmentsCache.set(fixtureType, result)
  return result ?? undefined
}

const segmentFixtureTypesCache = new WeakMap<FixtureType, FixtureType[]>()

/**
 * Returns a virtual fixture type for the given segment, which
 * - contains all shared channels as well as the segment's own channels
 * - replaces the channels of all other segments with {@link foreignSegmentChannel}
 *
 * @param segmentIndex 0-based segment index
 */
export function getSegmentFixtureType(
  fixtureType: FixtureType,
  segmentIndex: number
): FixtureType | undefined {
  const segments = getFixtureTypeSegments(fixtureType)
  if (!segments || segmentIndex < 0 || segmentIndex >= segments.count) {
    return undefined
  }

  let segmentTypes = segmentFixtureTypesCache.get(fixtureType)
  if (!segmentTypes) {
    segmentTypes = Array.from({ length: segments.count }, (_, index) => ({
      ...fixtureType,
      id: getSegmentMemberId(fixtureType.id, index + 1),
      name: `${fixtureType.name} (${index + 1})`,
      segments: false,
      mapping: fixtureType.mapping.map((channel, mappingIndex) => {
        const channelSegment = segments.segmentByMappingIndex[mappingIndex]
        return channelSegment === undefined || channelSegment === index
          ? channel
          : foreignSegmentChannel
      }),
    }))
    segmentFixtureTypesCache.set(fixtureType, segmentTypes)
  }

  return segmentTypes[segmentIndex]
}

export interface SegmentLayoutEntry {
  /** Center X coordinate, as fraction of the fixture's width (0-1). */
  x: number
  /** Center Y coordinate, as fraction of the fixture's height (0-1). */
  y: number
  /** Width as fraction of the fixture's width (0-1). */
  width: number
  /** Height as fraction of the fixture's height (0-1). */
  height: number
  /** Whether the segment should be displayed as a circle. */
  round: boolean
}

const segmentLayoutCache = new WeakMap<FixtureType, SegmentLayoutEntry[]>()

/**
 * Returns the layout of the given fixture type's segments within the fixture's shape.
 *
 * - Circle shapes (default) without `segmentColumns`: ring
 * - otherwise: grid with `segmentColumns` columns (defaults to a single row)
 */
export function getFixtureTypeSegmentLayout(
  fixtureType: FixtureType
): SegmentLayoutEntry[] {
  const segments = getFixtureTypeSegments(fixtureType)
  if (!segments) return []

  const cached = segmentLayoutCache.get(fixtureType)
  if (cached) return cached

  const { count } = segments
  let layout: SegmentLayoutEntry[]

  if (fixtureType.shape !== 'square' && !fixtureType.segmentColumns) {
    const radius = 0.32
    const size = Math.min(0.36, ((2 * Math.PI * radius) / count) * 0.85)
    layout = Array.from({ length: count }, (_, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / count
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        width: size,
        height: size,
        round: true,
      }
    })
  } else {
    const columns = Math.max(
      1,
      Math.min(Math.round(fixtureType.segmentColumns ?? count), count)
    )
    const rows = Math.ceil(count / columns)
    layout = Array.from({ length: count }, (_, index) => ({
      x: ((index % columns) + 0.5) / columns,
      y: (Math.floor(index / columns) + 0.5) / rows,
      width: 1 / columns,
      height: 1 / rows,
      round: false,
    }))
  }

  segmentLayoutCache.set(fixtureType, layout)
  return layout
}

const segmentFixturesCache = new WeakMap<Fixture, Fixture[]>()

/**
 * Returns virtual fixtures for all segments of the given fixture,
 * with their IDs and map coordinates adjusted.
 *
 * Returns an empty array if the fixture type has no segments.
 */
export function getSegmentFixtures(
  fixture: Fixture,
  fixtureType: FixtureType | undefined
): Fixture[] {
  if (!fixtureType || !getFixtureTypeSegments(fixtureType)) return []

  const cached = segmentFixturesCache.get(fixture)
  if (cached) return cached

  const xSize = fixtureType.xSize ?? defaultFixtureSize
  const ySize = fixtureType.ySize ?? defaultFixtureSize
  const rotation = ((fixture.rotation ?? 0) * Math.PI) / 180
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  const result = getFixtureTypeSegmentLayout(fixtureType).map(
    (entry, index): Fixture => {
      const dx = (entry.x - 0.5) * xSize
      const dy = (entry.y - 0.5) * ySize
      return {
        ...fixture,
        id: getSegmentMemberId(fixture.id, index + 1),
        name: `${fixture.name ?? fixture.id} (${index + 1})`,
        x:
          fixture.x !== undefined ? fixture.x + dx * cos - dy * sin : undefined,
        y:
          fixture.y !== undefined ? fixture.y + dx * sin + dy * cos : undefined,
      }
    }
  )

  segmentFixturesCache.set(fixture, result)
  return result
}

export interface ResolvedMember {
  /** The actual fixture (the parent fixture for segments). */
  fixture: Fixture
  fixtureType: FixtureType
  /** 0-based segment index, if the member is a segment. */
  segmentIndex?: number
}

/**
 * Resolves the given member ID (fixture ID or segment ID `foobar@2`)
 * to the fixture, its type, and the segment index.
 */
export function resolveMember(
  id: string,
  { fixtures, fixtureTypes }: FixtureMaps
): ResolvedMember | undefined {
  const fixture = fixtures.get(id)
  if (fixture) {
    const fixtureType = fixtureTypes.get(fixture.type)
    return fixtureType ? { fixture, fixtureType } : undefined
  }

  const parsed = parseSegmentMemberId(id)
  if (!parsed) return undefined

  const parent = fixtures.get(parsed.fixtureId)
  const fixtureType = parent ? fixtureTypes.get(parent.type) : undefined
  const segments = getFixtureTypeSegments(fixtureType)
  if (
    !parent ||
    !fixtureType ||
    !segments ||
    parsed.segment < 1 ||
    parsed.segment > segments.count
  ) {
    return undefined
  }

  return { fixture: parent, fixtureType, segmentIndex: parsed.segment - 1 }
}

/**
 * Returns the fixture for the given member ID.
 *
 * For segment IDs (`foobar@2`), a virtual fixture with adjusted coordinates is returned.
 */
export function getMemberFixture(
  id: string,
  masterDataMaps: FixtureMaps
): Fixture | undefined {
  const resolved = resolveMember(id, masterDataMaps)
  if (!resolved) return undefined
  if (resolved.segmentIndex === undefined) return resolved.fixture
  return getSegmentFixtures(resolved.fixture, resolved.fixtureType)[
    resolved.segmentIndex
  ]
}

/**
 * Maps the given fixture mapping strings to a list of unique member IDs.
 *
 * Like `mapFixtureList`, but resolves segments separately:
 * - `segments:<mapping>` -> all segments of the mapped fixtures (if their type has segments)
 * - `foobar@2` -> the single segment
 */
export function mapFixtureMemberList(
  fixtureList: string[],
  masterDataWithMaps: MasterDataWithMaps
): string[] {
  const { masterDataMaps } = masterDataWithMaps

  return fixtureList
    .flatMap(entry => {
      const { segments, base } = splitSegmentsPrefix(entry)
      if (segments) {
        return mapFixtureMemberList([base], masterDataWithMaps).flatMap(id => {
          const fixture = masterDataMaps.fixtures.get(id)
          if (!fixture) return [id]
          const segmentFixtures = getSegmentFixtures(
            fixture,
            masterDataMaps.fixtureTypes.get(fixture.type)
          )
          return segmentFixtures.length
            ? segmentFixtures.map(it => it.id)
            : [id]
        })
      }

      // `foobar@2`
      if (!masterDataMaps.fixtures.has(entry) && parseSegmentMemberId(entry)) {
        if (resolveMember(entry, masterDataMaps)) return [entry]
        logger.warn(`Segment "${entry}" not found, skipping mapping...`)
        return []
      }

      return mapFixtureList([entry], masterDataWithMaps)
    })
    .filter(isUnique)
}

/**
 * Returns whether the given fixture mapping string maps any fixture whose type has segments.
 */
export function hasFixtureMappingSegments(
  entry: string,
  masterDataWithMaps: MasterDataWithMaps
): boolean {
  const { masterDataMaps } = masterDataWithMaps
  return mapFixtureList([entry], masterDataWithMaps).some(id => {
    const fixture = masterDataMaps.fixtures.get(id)
    return !!getFixtureTypeSegments(
      fixture ? masterDataMaps.fixtureTypes.get(fixture.type) : undefined
    )
  })
}

/**
 * Toggles the `segments:` prefix of the given fixture mapping string.
 */
export function toggleFixtureMappingSegments(
  entry: string,
  segments?: boolean
): string {
  const split = splitSegmentsPrefix(entry)
  const newSegments = segments ?? !split.segments
  return newSegments ? FixtureMappingPrefix.Segments + split.base : split.base
}

/**
 * Writes the given channel values into the universe,
 * keeping the higher value for each channel.
 */
function writeValues(
  universe: { [index: number]: number },
  channel: number,
  values: number[]
) {
  values.forEach((value, offset) => {
    const index = channel - 1 + offset
    if (universe[index] < value) universe[index] = value
  })
}

/**
 * Writes the given fixture states into the given universe (0-based indices),
 * keeping the higher value for each channel.
 *
 * The keys can be both fixture IDs and segment IDs (`foobar@2`).
 *
 * For fixtures with a single physical master channel, segments with different master values
 * are emulated by setting the shared master channel to the highest value and dimming
 * the other segments' master-dependent channels accordingly.
 */
export function writeFixtureStatesToUniverse(
  universe: { [index: number]: number },
  fixtureStates: Dictionary<FixtureState>,
  masterDataMaps: FixtureMaps
): void {
  const segmentStatesByFixture = new Map<
    Fixture,
    { fixtureType: FixtureType; states: Map<number, FixtureState> }
  >()

  for (const [id, state] of Object.entries(fixtureStates)) {
    if (!state) continue
    const resolved = resolveMember(id, masterDataMaps)
    if (!resolved) continue
    const { fixture, fixtureType, segmentIndex } = resolved

    if (segmentIndex === undefined) {
      writeValues(
        universe,
        fixture.channel,
        mapFixtureStateToChannels(fixtureType, state)
      )
      continue
    }

    let entry = segmentStatesByFixture.get(fixture)
    if (!entry) {
      entry = { fixtureType, states: new Map() }
      segmentStatesByFixture.set(fixture, entry)
    }
    entry.states.set(segmentIndex, state)
  }

  for (const [fixture, { fixtureType, states }] of segmentStatesByFixture) {
    // Segments with their own master channel don't need to share it
    const hasMasterChannel =
      fixtureType.mapping.includes(ChannelType.Master) &&
      !getFixtureTypeSegments(fixtureType)?.masterPerSegment
    const getMaster = (state: FixtureState) =>
      state.on ? (state.channels[ChannelType.Master] ?? 255) : 0
    const sharedMaster = hasMasterChannel
      ? Math.max(0, ...[...states.values()].map(getMaster))
      : 255
    const masterDependentChannels = getMasterDependentChannels(fixtureType)

    for (const [segmentIndex, state] of states) {
      if (!state.on) continue
      const segmentType = getSegmentFixtureType(fixtureType, segmentIndex)
      if (!segmentType) continue

      let finalState = state

      if (hasMasterChannel) {
        const segmentMaster = getMaster(state)
        if (sharedMaster === 0 || segmentMaster === 0) continue
        const factor = segmentMaster / sharedMaster
        const channels: FixtureChannels = {
          ...state.channels,
          [ChannelType.Master]: sharedMaster,
        }
        if (factor !== 1) {
          for (const channel of masterDependentChannels) {
            const value = channels[channel]
            if (value) channels[channel] = Math.round(value * factor)
          }
        }
        finalState = { on: true, channels }
      }

      writeValues(
        universe,
        fixture.channel,
        mapFixtureStateToChannels(segmentType, finalState)
      )
    }
  }
}
