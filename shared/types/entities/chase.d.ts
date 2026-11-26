import { ValueOrRandom } from '../util'

import { FixtureOrder } from './fixture'
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
 * Controls which members of a {@link LiveChase} are selected for each step:
 * - `random`: random members
 * - otherwise: a window of consecutive members in the given order that moves with each step
 */
export type LiveChaseOrder = 'random' | FixtureOrder

/**
 * The direction in which the selection window of an ordered {@link LiveChase} moves:
 * - `forward`: from the first to the last member, then starting over
 * - `backward`: from the last to the first member, then starting over
 * - `ping-pong`: back and forth between the first and the last member
 */
export type LiveChaseOrderDirection = 'forward' | 'backward' | 'ping-pong'

/**
 * How far the selection window of an ordered {@link LiveChase} moves with each step:
 * - `member`: by one member
 * - `selection`: by the size of the selection, so consecutive steps do not overlap
 */
export type LiveChaseOrderAdvance = 'member' | 'selection'

/**
 * Controls how colors are chosen for each step of a {@link LiveChase}:
 * - `random`: randomly
 * - `equal`: (only for the `random` color mode) the selected members are distributed
 *   equally across all colors, in random order
 * - `sequential`:
 *   - for the `random` color mode: colors are applied in order of the members,
 *     shifting by one with each step
 *   - otherwise: each step applies the next color
 */
export type LiveChaseColorSelection = 'random' | 'equal' | 'sequential'

/**
 * A live chase steps through partially random states of one or more *colors*.
 *
 * The randomness saves the effort of having to program every single step, when all
 * that is needed is a certain color theme flashing at a certain speed.
 *
 * It is meant to be changed frequently throughout a live show.
 */
export interface LiveChase {
  /** The name of the chase. */
  name?: string

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

  /**
   * Controls how the colors are applied to the active members for each step.
   *
   * Defaults to `random`.
   */
  colorMode?: 'random' | 'same-color' | 'same-state'

  /**
   * Controls how colors are chosen for each step.
   *
   * Defaults to `random`.
   */
  colorSelection?: LiveChaseColorSelection

  /**
   * Controls which members are selected for each step.
   *
   * Defaults to `random`.
   */
  order?: LiveChaseOrder

  /**
   * The direction in which the selection moves for ordered chases.
   *
   * Defaults to `forward`.
   */
  orderDirection?: LiveChaseOrderDirection

  /**
   * How far the selection moves with each step for ordered chases.
   *
   * Defaults to `member`.
   */
  orderAdvance?: LiveChaseOrderAdvance

  /**
   * Displays the chase's widget in compact mode,
   * which only consists of the speed burst button.
   */
  compact?: boolean
}
