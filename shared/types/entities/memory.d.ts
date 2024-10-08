import { FixtureState, FixtureStateGradient } from './fixture'
import { DbEntity, EntityMembers } from './util'

/**
 * A state of a {@link MemoryScene}.
 * Can be either a simple fixture state or a gradient.
 */
export type MemorySceneState = FixtureState | FixtureStateGradient[]

/**
 * Preset for memory scene states.
 */
export interface MemorySceneStatePreset extends DbEntity {
  /** The name of the preset. */
  name: string

  /** The persisted state. */
  state: MemorySceneState
}

/**
 * A scene of a {@link Memory}.
 */
export interface MemoryScene {
  /** The members that this scene is applied to. */
  members: EntityMembers

  /**
   * Defaults how multiple {@link states} are applied to the given {@link members}:
   * - `row` tries to distribute the states equally in a row
   * - `alternate` cycles through the states for each member
   *
   * Defaults to `'row'`.
   */
  pattern?: 'row' | 'alternate'

  /**
   * Controls the order in which states and gradients are applied to the scene's members.
   *
   * Defaults to `members`.
   */
  order?: 'members' | 'xcoord' | 'ycoord' | 'x+y' | 'x-y'

  /** The states of the scene. */
  states: Array<MemorySceneState>
}

/**
 * A *memory* is a prepared state of multiple fixtures.
 *
 * It can contain multiple *scenes*, which can contain multiple *states* each,
 * displayed in different *patterns*.
 */
export interface Memory extends DbEntity {
  /** The name of the memory. */
  name?: string

  /**
   * Controls whether the memory is displayed as a fader, as a flash or toggle button,
   * or both a fader and a flash button.
   *
   * Defaults to `both`.
   */
  display?: 'fader' | 'flash' | 'toggle' | 'both'

  /** The scenes that make up this memory. */
  scenes: MemoryScene[]
}

/**
 * The state of a {@link Memory}.
 */
export interface MemoryState {
  /** Turns the memory on and off. */
  on: boolean

  /**
   * The intensity of the memory (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel unless {@link forceMaster} is set.
   */
  value: number

  /**
   * Flag to fade all of the channels the memory controls according to the {@link value},
   * independent of its master channels.
   *
   * This is usually used to control single channels for fixtures that are already
   * turned on through other controls.
   *
   * Defaults to `false`.
   */
  forceMaster?: boolean

  /**
   * Internal flag to mark the state as "initial" in order to skip it while
   * persisting the current application state.
   */
  initial?: boolean
}

/**
 * A live memory is a simpler form of a memory that is meant to be frequently
 * changed throughout a live show.
 *
 * It consists of a single scene that is directly displayed in the memory's widget.
 */
export interface LiveMemory extends MemoryScene {
  /** The name of the memory. */
  name?: string

  /** Turns the memory on and off. */
  on: boolean

  /**
   * The intensity of the memory (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel.
   */
  value: number

  /**
   * Controls whether the gradient movement is active.
   */
  gradientMovement?: boolean

  /**
   * The speed the memory's gradient moves (in seconds).
   */
  gradientSpeed?: number

  /**
   * Controls whether the gradient movement is inverted.
   */
  gradientMovementInverted?: boolean

  /**
   * Controls whether gradients only apply the offset of the movement instead
   * of adding the offset of the members within the scene
   * (i.e. applies the same state to all members)
   */
  gradientIgnoreFixtureOffset?: boolean
}
