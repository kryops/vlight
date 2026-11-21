import {
  ApiSequenceMessage,
  IdType,
  Sequence,
  SequenceControl,
  SequenceState,
} from '@vlight/types'
import { assertNever, deepEqual, logger } from '@vlight/utils'
import {
  getSequenceRepeatCount,
  getSequenceRunDuration,
  getSequenceStepTimes,
  isManualSequenceEnd,
  isManualSequenceStep,
} from '@vlight/controls'

import { registerApiMessageHandler } from '../../services/api/registry'
import { broadcastToSockets } from '../../services/http/websocket'
import { masterDataMaps } from '../../services/masterdata'
import { howLong } from '../../util/time'
import { applyAction, revertStateChanges, StateChange } from '../actions'
import { controlRegistry } from '../registry'
import { isPaused, registerPauseHandler } from '../pause'

import { sequenceStates } from './state'

/** Interval in ms in which the elapsed time of running sequences is broadcast. */
const timeUpdateInterval = 1000

/**
 * Maximum nesting depth of sequences starting other sequences (or themselves)
 * synchronously, to prevent endless recursion.
 */
const maxNestingDepth = 20

/**
 * Internal runtime state of a started sequence.
 *
 * The timing is relative to the current step (the "segment" until the next step),
 * so the sequence can wait for manual steps.
 */
interface SequenceRunner {
  id: IdType
  sequence: Sequence

  /** Times of all steps in ms relative to the start of a run (manual steps add no time). */
  stepTimes: number[]

  /** Duration of a single run in ms (excluding the time waiting for manual steps). */
  runDuration: number

  status: SequenceState['status']

  /**
   * While running: The (virtual) timestamp at which the current segment started,
   * i.e. when the current step was reached, adjusted for pauses.
   */
  segmentStart: number

  /**
   * While paused (or globally paused): The elapsed time in ms within the current segment.
   */
  pausedElapsed: number

  /** Index of the current run. */
  run: number

  /** Index of the current (= last executed) step, `-1` if none yet. */
  step: number

  /** Timer for the next step or the end of the run. */
  timer?: ReturnType<typeof setTimeout>

  /** Changes of the current step to revert at its end. */
  pendingReverts: StateChange[]
}

/** All started (running or paused) sequences. */
const runners = new Map<IdType, SequenceRunner>()

/** Current nesting depth of synchronous sequence executions. */
let nestingDepth = 0

const now = () => performance.now()

function setSequence(runner: SequenceRunner, sequence: Sequence) {
  runner.sequence = sequence
  runner.stepTimes = getSequenceStepTimes(sequence).map(time => time * 1000)
  runner.runDuration = getSequenceRunDuration(sequence) * 1000
}

function isCurrent(runner: SequenceRunner): boolean {
  return runners.get(runner.id) === runner
}

function isRunning(runner: SequenceRunner): boolean {
  return isCurrent(runner) && runner.status === 'running'
}

/** Whether the time of the sequence advances, i.e. it is running and not globally paused. */
function isTicking(runner: SequenceRunner): boolean {
  return runner.status === 'running' && !isPaused()
}

/**
 * Returns the delay in ms from the current step until the next step
 * (or the end of the run after the last step),
 * or `undefined` if the next step (or the end) is reached manually.
 */
function getNextDelay(runner: SequenceRunner): number | undefined {
  const { sequence, step, stepTimes, runDuration } = runner
  const nextStep = sequence.steps[step + 1]
  if (
    nextStep ? isManualSequenceStep(nextStep) : isManualSequenceEnd(sequence)
  ) {
    return undefined
  }

  const currentTime = step >= 0 ? stepTimes[step] : 0
  const nextTime = nextStep ? stepTimes[step + 1] : runDuration
  return Math.max(0, nextTime - currentTime)
}

function getSegmentElapsed(runner: SequenceRunner): number {
  return isTicking(runner) ? now() - runner.segmentStart : runner.pausedElapsed
}

/** Sets the elapsed time within the current segment, e.g. when starting a new one. */
function setSegmentElapsed(runner: SequenceRunner, elapsed: number) {
  runner.segmentStart = now() - elapsed
  runner.pausedElapsed = elapsed
}

/** Returns the elapsed time in ms within the current run. */
function getRunTime(runner: SequenceRunner): number {
  const stepTime = runner.step >= 0 ? runner.stepTimes[runner.step] : 0
  return (
    stepTime + Math.min(getSegmentElapsed(runner), getNextDelay(runner) ?? 0)
  )
}

function broadcastState(runner: SequenceRunner) {
  if (!isCurrent(runner)) return
  const state: SequenceState = {
    status: runner.status,
    time: Math.round(getRunTime(runner)) / 1000,
    step: runner.step,
    run: runner.run,
  }
  sequenceStates.set(runner.id, state)
  broadcastToSockets({ type: 'sequence-state', id: runner.id, state })
}

function clearTimer(runner: SequenceRunner) {
  if (runner.timer) clearTimeout(runner.timer)
  runner.timer = undefined
}

function schedule(runner: SequenceRunner, delay: number) {
  clearTimer(runner)
  runner.timer = setTimeout(() => {
    runner.timer = undefined
    processRunner(runner)
  }, delay)
}

function revertPending(runner: SequenceRunner) {
  const changes = runner.pendingReverts
  runner.pendingReverts = []
  revertStateChanges(changes)
}

function executeStep(runner: SequenceRunner, index: number) {
  revertPending(runner)
  runner.step = index

  const step = runner.sequence.steps[index]
  logger.debug(`Sequence ${runner.id}: executing step`, index)

  const changesToRevert: StateChange[] = []
  nestingDepth++
  try {
    for (const action of step.actions) {
      const changes = applyAction(action)
      if (action.revert) changesToRevert.push(...changes)
    }
  } finally {
    nestingDepth--
  }

  // If the sequence was stopped by one of its own actions, the step has already ended
  if (isCurrent(runner)) runner.pendingReverts.push(...changesToRevert)
  else revertStateChanges(changesToRevert)
}

/**
 * Advances the sequence by executing the next step,
 * or by ending the current run after the last step
 * (which starts the next run or stops the sequence).
 *
 * The timing of the new segment must be set up by the caller beforehand.
 */
function advance(runner: SequenceRunner) {
  const nextStep = runner.step + 1
  if (nextStep < runner.sequence.steps.length) {
    executeStep(runner, nextStep)
    return
  }

  // end of the run
  revertPending(runner)
  if (!isCurrent(runner)) return

  if (runner.run >= getSequenceRepeatCount(runner.sequence)) {
    stopRunner(runner, false)
    return
  }

  runner.run++
  runner.step = -1
}

/**
 * Executes all steps that are due, handles the end of a run,
 * and schedules the timer for the next event.
 *
 * Waits without a timer if the next step is a manual one,
 * or while globally paused.
 */
function processRunner(runner: SequenceRunner) {
  if (!isRunning(runner)) return
  clearTimer(runner)
  if (isPaused()) return

  let changed = false

  while (isRunning(runner) && !isPaused()) {
    const delay = getNextDelay(runner)
    if (delay === undefined) break

    const elapsed = now() - runner.segmentStart
    if (delay > elapsed) {
      schedule(runner, delay - elapsed)
      break
    }

    const isEndOfRun = runner.step + 1 >= runner.sequence.steps.length
    runner.segmentStart += delay
    advance(runner)
    changed = true

    // don't try to catch up if we are lagging behind more than a complete run
    if (isEndOfRun && now() - runner.segmentStart > runner.runDuration) {
      runner.segmentStart = now()
    }
  }

  if (changed) broadcastState(runner)
}

function createRunner(
  id: IdType,
  status: SequenceState['status']
): SequenceRunner | undefined {
  const sequence = masterDataMaps.sequences.get(id)
  if (!sequence) {
    logger.warn('no sequence found for ID', id)
    return undefined
  }

  const runner: SequenceRunner = {
    id,
    sequence,
    stepTimes: [],
    runDuration: 0,
    status,
    segmentStart: now(),
    pausedElapsed: 0,
    run: 0,
    step: -1,
    pendingReverts: [],
  }
  setSequence(runner, sequence)
  runners.set(id, runner)

  // broadcast first so the state is available for the actions of the first steps
  broadcastState(runner)
  return runner
}

function startSequence(id: IdType): boolean {
  const existing = runners.get(id)
  if (existing) return resumeSequence(existing)

  const runner = createRunner(id, 'running')
  if (!runner) return false
  processRunner(runner)
  return true
}

function resumeSequence(runner: SequenceRunner): boolean {
  if (runner.status === 'running') return false
  runner.status = 'running'
  setSegmentElapsed(runner, runner.pausedElapsed)
  broadcastState(runner)
  processRunner(runner)
  return true
}

function pauseSequence(id: IdType): boolean {
  const runner = runners.get(id)
  if (!runner || runner.status !== 'running') return false
  setSegmentElapsed(runner, getSegmentElapsed(runner))
  runner.status = 'paused'
  clearTimer(runner)
  broadcastState(runner)
  return true
}

/**
 * Immediately executes the next step.
 *
 * Stopped sequences are started in paused state, and paused sequences stay paused.
 * While globally paused, running sequences continue only after resuming.
 */
function nextSequenceStep(id: IdType): boolean {
  const runner = runners.get(id) ?? createRunner(id, 'paused')
  if (!runner) return false

  clearTimer(runner)
  setSegmentElapsed(runner, 0)

  advance(runner)
  broadcastState(runner)
  processRunner(runner)
  return true
}

function stopRunner(runner: SequenceRunner, revert = true) {
  clearTimer(runner)
  runners.delete(runner.id)
  sequenceStates.delete(runner.id)
  broadcastToSockets({ type: 'sequence-state', id: runner.id, state: null })
  if (revert) revertPending(runner)
}

function stopSequence(id: IdType): boolean {
  const runner = runners.get(id)
  if (!runner) return false
  stopRunner(runner)
  return true
}

/**
 * Applies the given control to a sequence.
 *
 * Returns whether anything changed.
 */
export function controlSequence(id: IdType, control: SequenceControl): boolean {
  if (nestingDepth >= maxNestingDepth && control !== 'stop') {
    logger.warn(
      `Sequence ${id}: maximum nesting depth reached, ignoring control`,
      control
    )
    return false
  }

  switch (control) {
    case 'start':
      return startSequence(id)
    case 'pause':
      return pauseSequence(id)
    case 'toggle':
      return runners.get(id)?.status === 'running'
        ? pauseSequence(id)
        : startSequence(id)
    case 'stop':
      return stopSequence(id)
    case 'restart': {
      stopSequence(id)
      return startSequence(id)
    }
    case 'next':
      return nextSequenceStep(id)
    default:
      assertNever(control)
      return false
  }
}

function handleApiMessage({ id, control }: ApiSequenceMessage): boolean {
  controlSequence(id, control)
  // the incoming message is not broadcast; state changes are broadcast separately
  return false
}

function broadcastTimes() {
  for (const runner of runners.values()) {
    if (isTicking(runner) && getNextDelay(runner) !== undefined) {
      broadcastState(runner)
    }
  }
}

/**
 * Freezes the time of all running sequences while globally paused,
 * and continues them from where they stopped when resuming.
 */
function handlePauseChange(paused: boolean) {
  for (const runner of runners.values()) {
    if (runner.status !== 'running') continue
    if (paused) {
      runner.pausedElapsed = now() - runner.segmentStart
      clearTimer(runner)
      broadcastState(runner)
    } else {
      runner.segmentStart = now() - runner.pausedElapsed
      broadcastState(runner)
      processRunner(runner)
    }
  }
}

function reload(reloadState?: boolean) {
  if (reloadState) {
    for (const runner of runners.values()) clearTimer(runner)
    runners.clear()
    sequenceStates.clear()
    return
  }

  // master data changed: stop deleted sequences, update changed ones
  for (const runner of runners.values()) {
    const sequence = masterDataMaps.sequences.get(runner.id)
    if (!sequence) {
      stopRunner(runner)
      continue
    }
    if (deepEqual(sequence, runner.sequence)) {
      runner.sequence = sequence
      continue
    }

    setSequence(runner, sequence)
    runner.step = Math.min(runner.step, sequence.steps.length - 1)
    broadcastState(runner)
    processRunner(runner)
  }
}

export function init(): void {
  const start = Date.now()

  controlRegistry.register({ reload })
  registerApiMessageHandler('sequence', handleApiMessage)
  registerPauseHandler(handlePauseChange)
  setInterval(broadcastTimes, timeUpdateInterval)

  howLong(start, 'initSequences')
}
