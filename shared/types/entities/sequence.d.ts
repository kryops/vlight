import { Action } from './action'
import { DbEntity } from './util'

/**
 * An action that is executed when a {@link SequenceStep} is reached.
 */
export type SequenceStepAction = Action & {
  /**
   * If set, the changes of this action are reverted at the end of the step, i.e.
   * - when the next step is reached
   * - for the last step: at the end of the run (see {@link Sequence.endDelay})
   * - when the sequence is stopped
   *
   * Changes are only reverted for the affected entities whose state has not been changed
   * in the meantime.
   *
   * Defaults to `false`.
   */
  revert?: boolean
}

/**
 * A single step of a {@link Sequence}.
 */
export interface SequenceStep {
  /** Optional display name. */
  name?: string

  /**
   * Delay in seconds after the previous step
   * (or after the start of the sequence for the first step).
   *
   * Fractions are allowed.
   *
   * If not set, the sequence waits at the previous step until it is
   * advanced manually (see the `next` sequence control).
   */
  delay?: number

  /** Actions to execute when the step is reached. */
  actions: SequenceStepAction[]
}

/**
 * Controls what happens at the end of a {@link Sequence}:
 * - `undefined` or `0`: The sequence stops
 * - a number `n`: The sequence is repeated `n` times (i.e. it is played `n + 1` times overall)
 * - `infinite`: The sequence is repeated until it is stopped
 */
export type SequenceRepeat = number | 'infinite'

/**
 * A programmable sequence of timed steps, each executing a list of actions.
 */
export interface Sequence extends DbEntity {
  /** Display name. */
  name?: string

  /** The steps of the sequence. */
  steps: SequenceStep[]

  /**
   * Controls whether the sequence is repeated.
   *
   * Defaults to `undefined` (no repetition).
   */
  repeat?: SequenceRepeat

  /**
   * Delay in seconds after the last step until the end of a run,
   * i.e. until the sequence is repeated or stops.
   *
   * The changes of the last step flagged with {@link SequenceStepAction.revert}
   * are reverted at the end of the run.
   *
   * If not set, the run only ends when the sequence is advanced manually
   * after the last step (see the `next` sequence control).
   */
  endDelay?: number
}

/**
 * Runtime state of a started {@link Sequence}.
 *
 * Stopped sequences do not have a state.
 */
export interface SequenceState {
  /** Whether the sequence is currently running or paused. */
  status: 'running' | 'paused'

  /**
   * Elapsed time in seconds within the current run.
   *
   * Time spent waiting for manual steps (without {@link SequenceStep.delay})
   * is not counted, i.e. the time stays at the time of the current step while waiting.
   *
   * Updated about once a second while the sequence is running.
   */
  time: number

  /** Index of the current (= last executed) step, `-1` if none was executed yet in this run. */
  step: number

  /** Index of the current run, starting with `0`. */
  run: number
}
