import { Sequence, SequenceState } from '@vlight/types'
import {
  getSequenceRepeatCount,
  getSequenceRunDuration,
  getSequenceStepTimes,
  isManualSequenceEnd,
  isManualSequenceStep,
} from '@vlight/controls'

/**
 * Formats a time in seconds for display, e.g. `4.5s` or `1:05`.
 */
export function formatSequenceTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds * 10) / 10}s`
  }
  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const rest = rounded % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/**
 * Returns a description of the current run, e.g. `Run 2/3`,
 * or `undefined` if the sequence is not repeated.
 */
export function getSequenceRunLabel(
  sequence: Sequence,
  state: SequenceState | undefined
): string | undefined {
  const repeatCount = getSequenceRepeatCount(sequence)
  if (repeatCount === 0) return undefined
  const total = repeatCount === Infinity ? '∞' : String(repeatCount + 1)
  return `Run ${(state?.run ?? 0) + 1}/${total}`
}

/**
 * Returns whether the sequence currently waits to be advanced manually,
 * i.e. the next step is a manual one, or the end of the run is reached manually.
 */
export function isSequenceWaitingForNext(
  sequence: Sequence,
  state: SequenceState | undefined
): boolean {
  if (!state) return false
  const nextStep = sequence.steps[state.step + 1]
  return nextStep
    ? isManualSequenceStep(nextStep)
    : isManualSequenceEnd(sequence)
}

/**
 * Returns the times of all steps in seconds as displayed on the timeline,
 * and the displayed duration of a run.
 *
 * As manual steps (without delay) and a manual end do not take any time,
 * they are displayed with the average delay of all timed steps so they can be distinguished.
 */
export function getSequenceDisplayTimes(sequence: Sequence): {
  stepTimes: number[]
  duration: number
} {
  const delays = [
    ...sequence.steps
      .filter(step => !isManualSequenceStep(step))
      .map(step => step.delay ?? 0),
    sequence.endDelay ?? 0,
  ].filter(delay => delay > 0)
  const manualDelay = delays.length
    ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length
    : 1

  let time = 0
  const stepTimes = sequence.steps.map(
    step =>
      (time += isManualSequenceStep(step)
        ? manualDelay
        : Math.max(0, step.delay ?? 0))
  )

  const realStepTimes = getSequenceStepTimes(sequence)
  const endDelay = isManualSequenceEnd(sequence)
    ? manualDelay
    : getSequenceRunDuration(sequence) - (realStepTimes.at(-1) ?? 0)

  return { stepTimes, duration: (stepTimes.at(-1) ?? 0) + endDelay }
}
