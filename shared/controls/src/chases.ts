import {
  Dictionary,
  FixtureState,
  LiveChase,
  MasterDataMaps,
  MasterDataWithMaps,
} from '@vlight/types'
import {
  computeRandomChannels,
  computeRandomValue,
  ensureBetween,
  filterArrayRandomly,
  randomArrayIndex,
  shuffleArray,
} from '@vlight/utils'

import { getMemberFixture, mapFixtureMemberList } from './segments'
import { getOrderValue, isOrderedByCoords } from './order'

/**
 * The progress of a live chase, which is carried over from one step to the next.
 */
export interface LiveChaseProgress {
  /** The start index of the selection window in the (oriented) member list. */
  offset: number

  /** The current direction of the selection window in `ping-pong` mode. */
  direction: 1 | -1

  /** The number of members that were selected in this step. */
  count: number

  /** The number of steps since the chase was created. Used for sequential colors. */
  step: number
}

/** Result of {@link getLiveChaseFixtureStates}. */
export interface LiveChaseStepResult {
  fixtureStates: Dictionary<FixtureState>
  progress: LiveChaseProgress
}

/**
 * Returns the number of members that are selected for the given (non-random)
 * light value.
 */
export function getLiveChaseActiveCount(
  memberCount: number,
  light: number
): number {
  return Math.round(memberCount * ensureBetween(light, 0, 1))
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor
}

/**
 * Returns the members in the order configured for the live chase,
 * reversed for the `backward` direction.
 *
 * For random chases, the order of the member list is used.
 */
function getOrientedMembers(
  liveChase: LiveChase,
  members: string[],
  masterDataMaps: MasterDataMaps
): string[] {
  const order = liveChase.order ?? 'random'
  if (order === 'random') return members

  const orderedMembers = isOrderedByCoords(order)
    ? members
        .map(member => {
          const fixture = getMemberFixture(member, masterDataMaps)
          return {
            member,
            value: fixture ? getOrderValue(fixture, order) : 0,
          }
        })
        .sort((a, b) => a.value - b.value)
        .map(it => it.member)
    : members

  return liveChase.orderDirection === 'backward'
    ? [...orderedMembers].reverse()
    : orderedMembers
}

function getNextProgress(
  liveChase: LiveChase,
  previous: LiveChaseProgress | undefined,
  memberCount: number,
  count: number,
  advance: boolean
): LiveChaseProgress {
  if (!previous) return { offset: 0, direction: 1, count, step: 0 }
  if (!advance) return { ...previous, count }

  const delta =
    liveChase.orderAdvance === 'selection' ? Math.max(previous.count, 1) : 1
  const step = previous.step + 1

  if (liveChase.orderDirection !== 'ping-pong') {
    return {
      offset: memberCount ? mod(previous.offset + delta, memberCount) : 0,
      direction: 1,
      count,
      step,
    }
  }

  // The window bounces back at both ends without wrapping around
  const maxOffset = Math.max(memberCount - count, 0)
  const offset = Math.min(previous.offset, maxOffset)
  let direction = previous.direction
  let nextOffset = offset + direction * delta

  if (nextOffset > maxOffset) {
    if (offset >= maxOffset) {
      direction = -1
      nextOffset = offset - delta
    } else {
      nextOffset = maxOffset
    }
  } else if (nextOffset < 0) {
    if (offset <= 0) {
      direction = 1
      nextOffset = offset + delta
    } else {
      nextOffset = 0
    }
  }

  return {
    offset: ensureBetween(nextOffset, 0, maxOffset),
    direction,
    count,
    step,
  }
}

/**
 * Returns the color indices for each of the active members for the
 * per-member (`random`) color mode.
 */
function getPerMemberColorIndices(
  liveChase: LiveChase,
  activeMembers: string[],
  orientedMembers: string[],
  step: number
): number[] {
  const numColors = liveChase.colors.length

  switch (liveChase.colorSelection) {
    case 'equal': {
      const numActive = activeMembers.length
      const perColor = Math.floor(numActive / numColors)
      const remainder = numActive % numColors
      const colorIndices = liveChase.colors.map((_, index) => index)
      const extraColors = shuffleArray(colorIndices).slice(0, remainder)
      return shuffleArray([
        ...colorIndices.flatMap(index => Array(perColor).fill(index)),
        ...extraColors,
      ])
    }

    case 'sequential': {
      // The colors move along the members with each step
      const indices = new Map(orientedMembers.map((it, index) => [it, index]))
      return activeMembers.map(member =>
        mod((indices.get(member) ?? 0) - step, numColors)
      )
    }

    default:
      return activeMembers.map(() => randomArrayIndex(liveChase.colors))
  }
}

/**
 * Creates the fixture states for the next step of a live chase,
 * applying random values where applicable.
 *
 * @param previousProgress the progress of the previous step, if any
 * @param advance whether to advance to the next step (`false` recomputes the
 *   current step, e.g. after changes to the chase)
 */
export function getLiveChaseFixtureStates(
  liveChase: LiveChase,
  { masterData, masterDataMaps }: MasterDataWithMaps,
  previousProgress?: LiveChaseProgress,
  advance = true
): LiveChaseStepResult {
  const fixtureStates: Dictionary<FixtureState> = {}

  const members = mapFixtureMemberList(liveChase.members, {
    masterData,
    masterDataMaps,
  })
  const light = computeRandomValue(liveChase.light)
  const count = getLiveChaseActiveCount(members.length, light)

  const progress = getNextProgress(
    liveChase,
    previousProgress,
    members.length,
    count,
    advance
  )

  if (!liveChase.colors.length) return { fixtureStates, progress }

  const orientedMembers = getOrientedMembers(liveChase, members, masterDataMaps)

  let activeMembers: string[]
  if ((liveChase.order ?? 'random') === 'random') {
    activeMembers = filterArrayRandomly(members, light)
  } else if (liveChase.orderDirection === 'ping-pong') {
    activeMembers = orientedMembers.slice(
      progress.offset,
      progress.offset + count
    )
  } else {
    activeMembers = Array.from(
      { length: count },
      (_, index) =>
        orientedMembers[mod(progress.offset + index, orientedMembers.length)]
    )
  }

  const colorMode = liveChase.colorMode ?? 'random'

  if (colorMode === 'random') {
    const colorIndices = getPerMemberColorIndices(
      liveChase,
      activeMembers,
      orientedMembers,
      progress.step
    )
    activeMembers.forEach((member, index) => {
      fixtureStates[member] = {
        on: true,
        channels: computeRandomChannels(
          liveChase.colors[colorIndices[index]].channels
        ),
      }
    })
    return { fixtureStates, progress }
  }

  const defaultColor =
    liveChase.colors[
      liveChase.colorSelection === 'sequential'
        ? mod(progress.step, liveChase.colors.length)
        : randomArrayIndex(liveChase.colors)
    ]
  const defaultState = computeRandomChannels(defaultColor.channels)

  activeMembers.forEach(member => {
    fixtureStates[member] = {
      on: true,
      channels:
        colorMode === 'same-state'
          ? defaultState
          : computeRandomChannels(defaultColor.channels),
    }
  })

  return { fixtureStates, progress }
}
