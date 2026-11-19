import {
  Dictionary,
  Fixture,
  LiveMovement,
  LiveMovementPattern,
  LiveMovementPosition,
  MasterDataWithMaps,
} from '@vlight/types'
import { assertNever, ensureBetween } from '@vlight/utils'

import { mapFixtureList } from './fixtures'
import { orderFixtures } from './order'
import { ChannelType } from './enums'

const tau = Math.PI * 2

const squareCorners: Array<[number, number]> = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
]

/** Default center position of a live movement. */
export const defaultLiveMovementCenter: LiveMovementPosition = {
  pan: 127,
  tilt: 127,
}

/** Default live movement speed (duration of a cycle in seconds). */
export const defaultLiveMovementSpeed = 8

/** Channel types that a fixture needs to be controlled by a live movement. */
export const liveMovementChannels: string[] = [
  ChannelType.Pan,
  ChannelType.Tilt,
]

function fraction(value: number) {
  return value - Math.floor(value)
}

/**
 * Returns the raw point of the given pattern for the given phase (0-1).
 *
 * Both coordinates are between -1 and 1.
 */
export function getLiveMovementPatternPoint(
  pattern: LiveMovementPattern,
  phase: number
): [number, number] {
  const t = fraction(phase)

  switch (pattern) {
    case 'line':
      return [Math.sin(tau * t), 0]

    case 'sine': {
      const x = -Math.cos(tau * t)
      return [x, Math.sin(Math.PI * (x + 1))]
    }

    case 'circle':
      return [Math.cos(tau * t), Math.sin(tau * t)]

    case 'square': {
      const segment = Math.floor(t * 4)
      const segmentFraction = t * 4 - segment
      const [x1, y1] = squareCorners[segment]
      const [x2, y2] = squareCorners[(segment + 1) % 4]
      return [
        x1 + (x2 - x1) * segmentFraction,
        y1 + (y2 - y1) * segmentFraction,
      ]
    }

    case 'eight':
      return [Math.sin(tau * t), Math.sin(2 * tau * t)]

    default:
      assertNever(pattern)
      return [0, 0]
  }
}

/**
 * Returns the position of the given movement for the given phase (0-1),
 * applying its center, scale and rotation.
 *
 * Coordinates are not rounded, but limited to 0-255.
 *
 * @param rotation - Rotation in degrees; defaults to the movement's rotation.
 *   Use {@link getLiveMovementMemberRotation} for the rotation of a specific member.
 */
export function getLiveMovementPosition(
  movement: Pick<
    LiveMovement,
    'pattern' | 'center' | 'scaleX' | 'scaleY' | 'rotation'
  >,
  phase: number,
  rotation = movement.rotation
): LiveMovementPosition {
  const [rawX, rawY] = getLiveMovementPatternPoint(movement.pattern, phase)
  const x = (rawX * movement.scaleX) / 2
  const y = (rawY * movement.scaleY) / 2
  const angle = (rotation / 360) * tau
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return {
    pan: ensureBetween(movement.center.pan + x * cos - y * sin, 0, 255),
    tilt: ensureBetween(movement.center.tilt + x * sin + y * cos, 0, 255),
  }
}

/** Returns whether the member at the given (ordered) index moves inverted. */
export function isLiveMovementMemberInverted(
  invert: LiveMovement['invert'],
  index: number,
  count: number
): boolean {
  switch (invert) {
    case undefined:
    case 'none':
      return false
    case 'all':
      return true
    case 'half':
      return index >= count / 2
    case 'alternate':
      return index % 2 === 1
    default:
      assertNever(invert)
      return false
  }
}

/**
 * Returns the phase (0-1) of the member at the given (ordered) index,
 * applying the movement's offset and inversion.
 */
export function getLiveMovementMemberPhase(
  movement: Pick<LiveMovement, 'offset' | 'invert'>,
  phase: number,
  index: number,
  count: number
): number {
  const memberPhase = phase + index * movement.offset
  return fraction(
    isLiveMovementMemberInverted(movement.invert, index, count)
      ? -memberPhase
      : memberPhase
  )
}

/**
 * Returns the rotation (in degrees) of the member at the given (ordered) index,
 * applying the movement's rotation offset.
 */
export function getLiveMovementMemberRotation(
  movement: Pick<LiveMovement, 'rotation' | 'rotationOffset'>,
  index: number
): number {
  return movement.rotation + index * (movement.rotationOffset ?? 0)
}

/**
 * Returns the ordered member fixtures of the given movement that have
 * pan and tilt channels.
 */
export function getLiveMovementFixtures(
  movement: LiveMovement,
  { masterData, masterDataMaps }: MasterDataWithMaps
): Fixture[] {
  const fixtures = mapFixtureList(movement.members, {
    masterData,
    masterDataMaps,
  })
    .map(id => masterDataMaps.fixtures.get(id)!)
    .filter(fixture => {
      const mapping = masterDataMaps.fixtureTypes.get(fixture.type)?.mapping
      return liveMovementChannels.every(channel => mapping?.includes(channel))
    })

  return orderFixtures(fixtures, movement.order)
}

/**
 * Computes the rounded positions of all members of the given movement
 * for the given phase (0-1).
 *
 * If `phase` is `null`, all members are positioned at the center.
 */
export function getLiveMovementFixturePositions(
  movement: LiveMovement,
  phase: number | null,
  masterDataWithMaps: MasterDataWithMaps
): Dictionary<LiveMovementPosition> {
  const fixtures = getLiveMovementFixtures(movement, masterDataWithMaps)
  const positions: Dictionary<LiveMovementPosition> = {}

  fixtures.forEach((fixture, index) => {
    const position =
      phase === null
        ? movement.center
        : getLiveMovementPosition(
            movement,
            getLiveMovementMemberPhase(movement, phase, index, fixtures.length),
            getLiveMovementMemberRotation(movement, index)
          )

    positions[fixture.id] = {
      pan: Math.round(position.pan),
      tilt: Math.round(position.tilt),
    }
  })

  return positions
}
