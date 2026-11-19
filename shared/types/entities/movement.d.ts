import { FixtureOrder } from './fixture'
import { EntityMembers } from './util'

/** The path pattern of a {@link LiveMovement}. */
export type LiveMovementPattern =
  | 'line'
  | 'sine'
  | 'circle'
  | 'square'
  | 'eight'

/**
 * Controls which members of a {@link LiveMovement} move in the inverted direction:
 * - `none`: no members are inverted
 * - `all`: all members are inverted
 * - `half`: the second half of the (ordered) members are inverted
 * - `alternate`: every second (ordered) member is inverted
 */
export type LiveMovementInvert = 'none' | 'all' | 'half' | 'alternate'

/** A pan/tilt position (0-255 each). */
export interface LiveMovementPosition {
  pan: number
  tilt: number
}

/**
 * A live movement moves the pan and tilt channels of its members
 * along a pattern.
 *
 * Fine channels are not controlled.
 */
export interface LiveMovement {
  /** The name of the movement. */
  name?: string

  /**
   * Turns the movement on and off.
   *
   * When turned off, the movement does not control its members' channels at all.
   */
  on: boolean

  /**
   * Starts and stops the movement.
   *
   * When stopped, the members stay at their current position.
   */
  stopped: boolean

  /** The members that the movement is applied to. */
  members: EntityMembers

  /**
   * Controls the order in which the stagger offset and inversion are applied to the members.
   *
   * Defaults to `members`.
   */
  order?: FixtureOrder

  /** The pattern to move along. */
  pattern: LiveMovementPattern

  /** The center of the pattern. */
  center: LiveMovementPosition

  /** The width of the pattern in DMX values (0-255). */
  scaleX: number

  /** The height of the pattern in DMX values (0-255). */
  scaleY: number

  /**
   * The rotation of the pattern in degrees.
   *
   * The UI offers 0-180, as rotating by another 180 degrees only changes the
   * pattern's phase or direction, which can be achieved through {@link invert}.
   */
  rotation: number

  /**
   * The additional rotation between two consecutive members in degrees.
   *
   * The UI offers 0-90.
   *
   * Defaults to 0.
   */
  rotationOffset?: number

  /**
   * The time (phase) offset between two consecutive members as fraction of a whole cycle.
   *
   * The UI offers 0-0.5.
   */
  offset: number

  /** The duration of a whole cycle in seconds. */
  speed: number

  /**
   * Controls which members move in the inverted direction.
   *
   * Defaults to `none`.
   */
  invert?: LiveMovementInvert
}
