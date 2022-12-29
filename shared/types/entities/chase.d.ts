import { ValueOrRandom } from '../util'

import { DbEntity, Dictionary, EntityMembers } from './util'

/**
 * A state of fixture channels that can contain random values computed from a set
 * or a range of possible values.
 */
export type RandomChannels = Dictionary<ValueOrRandom<number>>

/**
 * A color definition for a {@link LiveChase}, which may contain random values.
 */
export interface ChaseColor {
  /** The channels that define this color. */
  channels: RandomChannels

  /** default: 1 */
  // distribution?: number
}

/**
 * Preset for live chase colors.
 */
export interface ChaseColorPreset extends DbEntity {
  /** The name of the preset. */
  name: string

  /** The persisted chase colors. */
  colors: ChaseColor[]
}

/**
 * A live chase steps through partially random states of one or more *colors*.
 *
 * The randomness saves the effort of having to program every single step, when all
 * that is needed is a certain color theme flashing at a certain speed.
 *
 * It is meant to be changed frequently throughout a live show.
 */
export interface LiveChase {
  /**
   * Turns the chase on and off.
   *
   * When turned off, the chase is **not** stopped automatically; when turned on again,
   * it will continue as before.
   */
  on: boolean

  /**
   * Starts and stops the chase.
   *
   * Starting the chase will automatically turn it on when off.
   *
   * When stopped, the chase will stay at the same state unless
   * - it is started again
   * - a {@link step} is made
   * - it is turned off, modified, and turned on again
   */
  stopped: boolean

  /** The members that the chase is applied to. */
  members: EntityMembers

  /**
   * The intensity of the chase (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel.
   */
  value: number

  /** The duration between two steps in seconds. */
  speed: number

  /**
   * Value or random definition between 0 and 1 that controls how many of the {@link members}
   * should be turned on for each step:
   * - 0: no fixtures are turned on
   * - 1: all fixtures are turned on
   */
  light: ValueOrRandom<number>

  /** The colors that make up this chase. */
  colors: ChaseColor[]

  /** Draft for new colors to apply. */
  colorsDraft?: ChaseColor[] | null

  /**
   * The fade speed in seconds.
   * For values greater than {@link speed}, the fading will never complete, but
   * switch to fading to the next step mid-fade.
   *
   * Defaults to 0.
   */
  fade?: number

  /**
   * Controls whether the {@link fade} time should be locked to the {@link speed}.
   *
   * This way, the fade time can be set to "half the speed", and stay in sync when
   * the speed is changed.
   */
  fadeLockedToSpeed?: boolean

  /**
   * Single chase mode.
   *
   * When the chase is turned on or started, all other live chases in single mode
   * are stopped and turned off.
   */
  single?: boolean

  /**
   * Burst mode - the chase is temporarily set to step very fast.
   *
   * In burst mode, {@link single} mode is ignored, i.e. other active chases are **not**
   * turned off.
   */
  burst?: boolean
}
