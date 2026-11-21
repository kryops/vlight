import { css } from '@linaria/core'
import { Sequence } from '@vlight/types'
import { getSequenceRunDuration } from '@vlight/controls'

import { controlSequence, setPaused } from '../../api'
import { useApiState, useApiStateEntry } from '../../hooks/api'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import {
  iconConfig,
  iconNext,
  iconPause,
  iconSequence,
  iconStart,
  iconStop,
} from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline, successShade, textShade, warnShade } from '../../ui/styles'
import { activeButton } from '../../ui/css/widget-controls'

import { SequenceTimeline } from './sequence-timeline'
import {
  formatSequenceTime,
  getSequenceRunLabel,
  isSequenceWaitingForNext,
} from './utils'

const widgetStyle = css`
  min-width: ${baseline(72)};
`

const container = css`
  width: 100%;
`

const bottomRow = css`
  display: flex;
  align-items: center;
  gap: ${baseline(2)};
`

const buttons = css`
  display: flex;
  flex: 0 0 auto;

  & > * {
    margin-left: 0;
  }
`

const info = css`
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.8rem;
  color: ${textShade(1)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const infoRight = css`
  flex: 0 0 auto;
  font-size: 0.8rem;
  color: ${textShade(1)};
  text-align: right;
`

export interface SequenceWidgetProps extends WidgetPassthrough {
  sequence: Sequence
}

/**
 * Widget to control a sequence.
 *
 * Displays start/pause/stop buttons and a timeline of all steps.
 */
export const SequenceWidget = ({
  sequence,
  ...passThrough
}: SequenceWidgetProps) => {
  const { id, steps } = sequence
  const state = useApiStateEntry('sequences', id) ?? undefined
  const running = state?.status === 'running'
  const globallyPaused = useApiState('paused')

  const start = () => controlSequence(id, 'start')
  const pause = () => controlSequence(id, 'pause')
  const stop = () => controlSequence(id, 'stop')
  const toggle = () => controlSequence(id, 'toggle')
  const next = () => controlSequence(id, 'next')
  const openEditor = () => openEntityEditorForId('sequences', id)

  const duration = getSequenceRunDuration(sequence)
  const currentStep = state && state.step >= 0 ? steps[state.step] : undefined
  const runLabel = getSequenceRunLabel(sequence, state)
  const nextStep = steps[(state?.step ?? -1) + 1]
  const waiting = running && isSequenceWaitingForNext(sequence, state)

  return (
    <Widget
      icon={iconSequence}
      title={sequence.name ?? id}
      onTitleClick={toggle}
      turnedOn={!!state}
      titleSide={
        <Icon
          title="Edit sequence"
          icon={iconConfig}
          onClick={openEditor}
          shade={1}
          hoverable
          inline
        />
      }
      className={widgetStyle}
      {...passThrough}
    >
      <div className={container}>
        <SequenceTimeline sequence={sequence} state={state} />
        <div className={bottomRow}>
          <div className={buttons}>
            {running && globallyPaused ? (
              <Button
                icon={iconStart}
                title="Paused globally - resume"
                iconColor={warnShade(0)}
                transparent
                onDown={() => setPaused(false)}
              />
            ) : running ? (
              <Button
                icon={iconPause}
                title="Pause"
                iconColor={warnShade(0)}
                transparent
                onDown={pause}
              />
            ) : (
              <Button
                icon={iconStart}
                title={state ? 'Resume' : 'Start'}
                iconColor={successShade(0)}
                transparent
                onDown={start}
              />
            )}
            <Button
              icon={iconNext}
              title={
                state && !running
                  ? 'Next step (stays paused)'
                  : nextStep
                    ? 'Next step'
                    : 'End run'
              }
              transparent
              className={waiting ? activeButton : undefined}
              onDown={next}
            />
            {state && (
              <Button
                icon={iconStop}
                title="Stop (reset to start)"
                transparent
                onDown={stop}
              />
            )}
          </div>
          <div className={info}>
            {state
              ? currentStep
                ? `Step ${state.step + 1}/${steps.length}${currentStep.name ? `: ${currentStep.name}` : ''}`
                : 'Not started'
              : `${steps.length} Steps`}
          </div>
          <div className={infoRight}>
            {state && `${formatSequenceTime(Math.floor(state.time))} / `}
            {formatSequenceTime(duration)}
            {runLabel && state && (
              <>
                <br />
                {runLabel}
              </>
            )}
          </div>
        </div>
      </div>
    </Widget>
  )
}
