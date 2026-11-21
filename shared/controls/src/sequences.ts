import { Sequence, SequenceStep } from '@vlight/types'

/**
 * Minimum duration of a run in seconds for repeating sequences,
 * to prevent endless loops for sequences without any delays.
 */
export const minRepeatingSequenceRunDuration = 0.1

/**
 * Returns the number of times a sequence is repeated after its first run
 * (`Infinity` for infinitely repeating sequences).
 */
export function getSequenceRepeatCount(sequence: Sequence): number {
  const { repeat } = sequence
  if (repeat === 'infinite') return Infinity
  return Math.max(0, Math.floor(repeat ?? 0))
}

/**
 * Returns whether the given step is only executed manually, as it has no delay.
 */
export function isManualSequenceStep(step: SequenceStep): boolean {
  return step.delay === undefined || step.delay === null
}

/**
 * Returns whether the end of a run of the given sequence is only reached manually,
 * as it has no delay after the last step.
 */
export function isManualSequenceEnd(sequence: Sequence): boolean {
  return sequence.endDelay === undefined || sequence.endDelay === null
}

/**
 * Returns the times of all steps in seconds relative to the start of a run.
 *
 * Manual steps (without delay) do not add any time.
 */
export function getSequenceStepTimes(sequence: Sequence): number[] {
  let time = 0
  return sequence.steps.map(step => (time += Math.max(0, step.delay || 0)))
}

/**
 * Returns the duration of a single run of the sequence in seconds,
 * including the delay after the last step.
 *
 * The time waiting for manual steps or a manual end is not included.
 */
export function getSequenceRunDuration(sequence: Sequence): number {
  const lastStepTime = getSequenceStepTimes(sequence).at(-1) ?? 0
  const duration = lastStepTime + Math.max(0, sequence.endDelay || 0)
  return getSequenceRepeatCount(sequence) > 0 && !isManualSequenceEnd(sequence)
    ? Math.max(duration, minRepeatingSequenceRunDuration)
    : duration
}
