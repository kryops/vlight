import { FixtureState } from './fixture'
import { LiveChase } from './chase'
import { LiveMemory, MemoryState } from './memory'
import { LiveMovement } from './movement'
import { DbEntity, Dictionary, EntityMembers, IdType } from './util'

/**
 * Base type for actions that change the state of one or multiple entities.
 */
interface EntityStateActionBase<TState> {
  /**
   * The state to apply.
   *
   * In {@link partial} mode, it contains only the changes to apply, e.g.
   * `{ on: true }` or `{ channels: { r: 255 } }`.
   */
  state: Partial<TState>

  /**
   * If set, the {@link state} is merged onto the existing one, i.e.
   * only the contained values are changed.
   *
   * Otherwise, the complete state is replaced.
   *
   * Defaults to `false`.
   */
  partial?: boolean
}

/**
 * Base type for actions whose changes can be faded.
 *
 * What is faded depends on the entity type:
 * - Channels, fixtures, fixture groups, live memories: all changes
 * - Memories, live chases: turning on/off and changing the value
 *   (the steps of live chases are faded independently)
 *
 * Other changes are applied immediately.
 */
interface FadeableActionBase {
  /**
   * Fade time in seconds.
   *
   * Defaults to 0.
   */
  fade?: number

  /**
   * Fade time in seconds when the changes are reverted.
   *
   * Defaults to {@link fade}.
   */
  revertFade?: number
}

/** Sets one or multiple DMX channels. */
export interface ChannelsAction extends FadeableActionBase {
  type: 'channels'

  /**
   * The channels to set:
   * - keys from 1-512
   * - values from 0-255
   */
  channels: Dictionary<number>
}

/** Changes the global DMX master. */
export interface DmxMasterAction {
  type: 'dmx-master'

  /** DMX master value from 0-255. */
  value?: number

  /** Fade time in seconds. */
  fade?: number
}

/**
 * A global control:
 * - `all-off`: Turns all controls off
 * - `stop-all`: Stops all chases, movements, moving live memory gradients, and sequences
 * - `pause` / `resume` / `toggle-pause`: Changes the global pause state (which also pauses running sequences)
 */
export type GlobalControl =
  | 'all-off'
  | 'stop-all'
  | 'pause'
  | 'resume'
  | 'toggle-pause'

/** Triggers a global control. */
export interface GlobalControlAction {
  type: 'global'
  control: GlobalControl
}

/** Changes the state of one or multiple fixtures. */
export interface FixtureAction
  extends EntityStateActionBase<FixtureState>, FadeableActionBase {
  type: 'fixture'

  /** The affected fixtures. */
  members: EntityMembers
}

/** Changes the state of one or multiple fixture groups. */
export interface FixtureGroupAction
  extends EntityStateActionBase<FixtureState>, FadeableActionBase {
  type: 'fixture-group'
  ids: IdType[]
}

/** Changes the state of one or multiple memories. */
export interface MemoryAction
  extends EntityStateActionBase<MemoryState>, FadeableActionBase {
  type: 'memory'
  ids: IdType[]
}

/**
 * Changes the state of one or multiple live memories.
 *
 * In non-{@link EntityStateActionBase.partial partial} mode, the name of the live memory is kept.
 */
export interface LiveMemoryAction
  extends EntityStateActionBase<LiveMemory>, FadeableActionBase {
  type: 'live-memory'
  ids: IdType[]
}

/**
 * Changes the state of one or multiple live chases.
 *
 * In non-{@link EntityStateActionBase.partial partial} mode, the name of the live chase is kept.
 */
export interface LiveChaseAction
  extends EntityStateActionBase<LiveChase>, FadeableActionBase {
  type: 'live-chase'
  ids: IdType[]

  /**
   * If set, the live chases are moved one step forward after applying the state
   * (like the step button). Stepping is not reverted.
   */
  step?: boolean
}

/**
 * Changes the state of one or multiple live movements.
 *
 * In non-{@link EntityStateActionBase.partial partial} mode, the name of the live movement is kept.
 */
export interface LiveMovementAction extends EntityStateActionBase<LiveMovement> {
  type: 'live-movement'
  ids: IdType[]

  /**
   * If set, the phase of the live movements is reset after applying the state,
   * so that all members return to the center (like the reset button).
   * Resetting is not reverted.
   */
  reset?: boolean
}

/**
 * A control to apply to a sequence:
 * - `start`: Starts the sequence from the beginning, or resumes it if paused
 * - `pause`: Pauses the sequence
 * - `toggle`: Pauses the sequence if running, otherwise starts/resumes it
 * - `stop`: Stops the sequence and resets it to the start
 * - `restart`: Stops the sequence and starts it again from the beginning
 * - `next`: Immediately executes the next step (or ends the current run after the last step).
 *   A stopped or paused sequence executes the next step, but stays paused afterwards
 */
export type SequenceControl =
  | 'start'
  | 'pause'
  | 'toggle'
  | 'stop'
  | 'restart'
  | 'next'

/**
 * Controls one or multiple sequences.
 *
 * When reverted, the previous status (running/paused/stopped) of the sequences is restored.
 */
export interface SequenceAction {
  type: 'sequence'
  ids: IdType[]
  control: SequenceControl
}

/**
 * Presses or releases one or multiple programmable buttons,
 * as if done via the UI.
 *
 * Buttons in `toggle` mode are toggled when pressed, and ignore releases.
 *
 * When reverted, the previous active state of the buttons is restored.
 *
 * A button cannot press or release itself (also indirectly through other buttons).
 */
export interface ButtonAction {
  type: 'button'
  ids: IdType[]

  /** If set, the buttons are pressed; otherwise, they are released. */
  down: boolean
}

/**
 * Triggers one or multiple {@link NamedAction named actions}.
 *
 * Named actions can trigger other named actions, but not themselves
 * (also indirectly through other named actions).
 */
export interface NamedActionsAction {
  type: 'action'
  ids: IdType[]
}

/**
 * An action that changes the application state, e.g. turning on a memory.
 *
 * Actions are independent from the controls that trigger them (e.g. programmable buttons).
 */
export type Action =
  | ChannelsAction
  | DmxMasterAction
  | GlobalControlAction
  | FixtureAction
  | FixtureGroupAction
  | MemoryAction
  | LiveMemoryAction
  | LiveChaseAction
  | LiveMovementAction
  | SequenceAction
  | ButtonAction
  | NamedActionsAction

/** The type of an {@link Action}. */
export type ActionType = Action['type']

/**
 * An action with a name, so it can be reused by programmable buttons, sequences,
 * and other named actions through a {@link NamedActionsAction}.
 *
 * Whether its changes are reverted is controlled where it is used.
 */
export type NamedAction = Action &
  DbEntity & {
    /** Display name. */
    name?: string
  }
