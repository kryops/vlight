import { FixtureState, FixtureStateGradient } from './fixture'
import { DbEntity, EntityMembers } from './util'

/**
 * A state of a {@link MemoryScene}.
 * Can be either a simple fixture state or a gradient.
 */
export type MemorySceneState = FixtureState | FixtureStateGradient[]

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
}
