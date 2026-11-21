import { css } from '@linaria/core'
import { Sequence, SequenceState } from '@vlight/types'
import {
  getSequenceRunDuration,
  getSequenceStepTimes,
  isManualSequenceEnd,
  isManualSequenceStep,
} from '@vlight/controls'
import { useEffect, useState } from 'react'

import {
  baseline,
  primaryShade,
  successShade,
  textShade,
  warnShade,
} from '../../ui/styles'
import { cx } from '../../util/styles'
import { useApiState } from '../../hooks/api'

import {
  formatSequenceTime,
  getSequenceDisplayTimes,
  isSequenceWaitingForNext,
} from './utils'

const timeline = css`
  position: relative;
  height: ${baseline(8)};
  margin: ${baseline(2)} ${baseline(2)};
  border-bottom: 1px solid ${primaryShade(1)};
`

const progress = css`
  position: absolute;
  left: 0;
  bottom: 0;
  height: ${baseline(1)};
  background: ${successShade(1)};
  opacity: 0.6;
`

/** Wider container to make the thin step lines easier to hover. */
const stepContainer = css`
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${baseline(3)};
  margin-left: ${baseline(-1.5)};
  display: flex;
  justify-content: center;
  cursor: default;
`

const stepLine = css`
  width: 2px;
  height: 100%;
  background: ${textShade(1)};
`

/** Manual steps (without delay) are displayed dashed. */
const stepLine_manual = css`
  background: repeating-linear-gradient(
    to bottom,
    ${textShade(1)} 0 ${baseline(1)},
    transparent ${baseline(1)} ${baseline(1.75)}
  );
`

const stepLine_executed = css`
  background: ${successShade(0)};
`

const stepLine_current = css`
  width: 4px;
`

const marker = css`
  position: absolute;
  top: ${baseline(-1)};
  bottom: ${baseline(-1)};
  width: 2px;
  margin-left: -1px;
  background: ${warnShade(0)};
  pointer-events: none;
`

const animated_running = css`
  transition:
    left 1s linear,
    width 1s linear;
`

const animated_paused = css`
  transition:
    left 0.2s ease-out,
    width 0.2s ease-out;
`

export interface SequenceTimelineProps {
  sequence: Sequence

  /** The runtime state, `undefined` if the sequence is stopped. */
  state: SequenceState | undefined

  className?: string
}

/**
 * Timeline of a sequence that displays all steps as vertical lines
 * spaced according to their delays, and the current position.
 *
 * Manual steps (without delay) are displayed dashed, spaced with the average delay.
 */
export function SequenceTimeline({
  sequence,
  state,
  className,
}: SequenceTimelineProps) {
  const { steps } = sequence
  const realStepTimes = getSequenceStepTimes(sequence)
  const realDuration = getSequenceRunDuration(sequence)
  const { stepTimes, duration } = getSequenceDisplayTimes(sequence)
  const manualEnd = isManualSequenceEnd(sequence)

  const getPosition = (displayTime: number) =>
    duration > 0
      ? `${(Math.min(displayTime, duration) / duration) * 100}%`
      : '0%'

  const globallyPaused = useApiState('paused')
  // whether the time advances
  const running = state?.status === 'running' && !globallyPaused
  const step = state?.step ?? -1
  const nextStep = steps[step + 1]
  const waiting = isSequenceWaitingForNext(sequence, state)

  // Within the segment after the current step, real and displayed times only differ by an offset
  const toDisplayTime = (realTime: number) =>
    realTime + (step >= 0 ? stepTimes[step] - realStepTimes[step] : 0)

  // The backend only sends updates about once a second, so while running,
  // we animate towards the position expected at the next update
  const nextEventTime = nextStep ? realStepTimes[step + 1] : realDuration
  const predictedTime =
    state && running && !waiting
      ? Math.min(state.time + 1, nextEventTime)
      : (state?.time ?? 0)

  return (
    <div className={cx(timeline, className)}>
      {state && (
        <TimelinePosition
          // re-mount for every run so the position does not animate backwards
          key={state.run}
          currentPosition={getPosition(toDisplayTime(state.time))}
          targetPosition={getPosition(toDisplayTime(predictedTime))}
          running={running}
        />
      )}
      {steps.map((step, index) => {
        const executed = !!state && index <= state.step
        const manual = isManualSequenceStep(step)
        const label = `${index + 1}. ${step.name ? step.name + ' ' : ''}(${manual ? 'manual' : formatSequenceTime(realStepTimes[index])})`
        return (
          <div
            key={index}
            className={stepContainer}
            style={{ left: getPosition(stepTimes[index]) }}
            title={label}
          >
            <div
              className={cx(
                stepLine,
                manual && !executed && stepLine_manual,
                executed && stepLine_executed,
                state?.step === index && stepLine_current
              )}
            />
          </div>
        )
      })}
      {manualEnd && (
        <div
          className={stepContainer}
          style={{ left: '100%' }}
          title="End (manual)"
        >
          <div className={cx(stepLine, stepLine_manual)} />
        </div>
      )}
    </div>
  )
}

/**
 * Returns `false` for the first rendered frame, and `true` afterwards,
 * so CSS transitions can start from the initial values.
 */
function useAfterFirstPaint(): boolean {
  const [painted, setPainted] = useState(false)
  useEffect(() => {
    let innerFrame: number | undefined
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setPainted(true))
    })
    return () => {
      cancelAnimationFrame(outerFrame)
      if (innerFrame !== undefined) cancelAnimationFrame(innerFrame)
    }
  }, [])
  return painted
}

/**
 * Progress bar and marker of the current position.
 *
 * Starts at the current position, then animates towards the target position.
 */
function TimelinePosition({
  currentPosition,
  targetPosition,
  running,
}: {
  currentPosition: string
  targetPosition: string
  running: boolean
}) {
  const painted = useAfterFirstPaint()
  const position = painted ? targetPosition : currentPosition
  const animated = running ? animated_running : animated_paused

  return (
    <>
      <div className={cx(progress, animated)} style={{ width: position }} />
      <div className={cx(marker, animated)} style={{ left: position }} />
    </>
  )
}
