import { ChaseColor, IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { useEffect, useRef, useState } from 'react'
import { ensureBetween, isTruthy } from '@vlight/utils'
import { ChannelType } from '@vlight/controls'

import { deleteLiveChase, setLiveChaseState, setLiveChaseStep } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import {
  iconAdd,
  iconChase,
  iconDelete,
  iconDoubleSpeed,
  iconFast,
  iconHalfSpeed,
  iconMultiple,
  iconOk,
  iconPercentage,
  iconRename,
  iconSingle,
  iconSlow,
  iconSpeedBurst,
  iconStart,
  iconStep,
  iconStop,
  iconSync,
  iconTime,
} from '../../ui/icons'
import {
  baseline,
  errorShade,
  primaryShade,
  successShade,
} from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { buttonCancel, buttonOk, yesNo } from '../../ui/overlays/buttons'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { Button } from '../../ui/buttons/button'
import { useTapSync } from '../../hooks/speed'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'
import { cx } from '../../util/styles'
import { apiState } from '../../api/api-state'

import { getChasePreviewColor } from './utils'
import { ChaseColorsEditor } from './chase-colors-editor'

/** 25 fps */
const maxSpeed = 0.04
const fastMinSpeed = 2
const minSpeed = 5

const leftColumn = css`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const rightColumn = flexAuto

const colorContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const draftContainer = css`
  margin-left: ${baseline()};
  border: 1px dashed ${primaryShade(0)};
  padding: ${baseline()};
`

const colorStyle = css`
  flex: 1 1 auto;
  height: ${baseline(8)};
  width: ${baseline(12)};
  margin-bottom: ${baseline()};
  cursor: pointer;
`

const controls = css`
  margin: ${baseline(-1.5)};
`

const activeButton = css`
  position: relative;

  &:after {
    position: absolute;
    top: ${baseline(0.5)};
    left: ${baseline(1.5)};
    content: '';
    width: ${baseline(7.5)};
    height: ${baseline(7.5)};
    border-radius: 100%;
    border: 2px solid ${successShade(0)};
    pointer-events: none;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`

export interface StatelessLiveChaseWidgetProps {
  id: IdType
  state: LiveChase
  title?: string
}

/**
 * Stateless widget to display a live chase.
 */
export const StatelessLiveChaseWidget = memoInProduction(
  ({ id, state, title }: StatelessLiveChaseWidgetProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)
    const updateSpeed = (speed: number) => {
      if (state.fadeLockedToSpeed && state.fade) {
        update({
          speed,
          fade: ensureBetween(
            (speed * state.fade) / state.speed,
            maxSpeed,
            minSpeed
          ),
        })
      } else {
        update({ speed })
      }
    }
    const tapSync = useTapSync(updateSpeed)

    const isCurrentlyFast =
      state.speed <= fastMinSpeed && (!state.fade || state.fade <= fastMinSpeed)
    const [fastMode, setFastMode] = useState(isCurrentlyFast)
    const useFastMode = fastMode && isCurrentlyFast

    useEffect(() => {
      if (!isCurrentlyFast) setFastMode(false)
    }, [isCurrentlyFast])

    const speedBurstBackup = useRef<
      Partial<LiveChase> & { otherChases?: string[] }
    >({})
    const startSpeedBurst = () => {
      // likely hit the button multiple times
      if (!state.burst) {
        // disable other chases temporarily in single mode
        const otherChases =
          state.single && !state.on
            ? Object.keys(apiState.liveChases).filter(
                chase => chase !== id && apiState.liveChases[chase].on
              )
            : []
        otherChases.forEach(chase =>
          setLiveChaseState(chase, { on: false }, true)
        )

        speedBurstBackup.current = {
          speed: state.speed,
          fade: state.fade,
          stopped: state.stopped,
          on: state.on,
          burst: false,
          otherChases,
        }
      }
      update({
        speed: maxSpeed,
        fade: 0,
        stopped: false,
        on: true,
        burst: true,
      })
    }

    const stopSpeedBurst = () => {
      const { otherChases, ...chaseState } = speedBurstBackup.current
      update(chaseState)
      // If the chase was fading before, this will trigger an additional step to start fading again immediately
      setLiveChaseStep(id)
      otherChases?.forEach(chase =>
        setLiveChaseState(chase, { on: true }, true)
      )
    }

    const openColorDialog = async ({
      colors,
      initialIndex,
      isDraft,
    }: {
      colors: ChaseColor[]
      initialIndex: number
      isDraft?: boolean
    }) => {
      const draftValue = 'draft'
      let newColors: ChaseColor[] = colors
      const result = await showDialog<true | null | typeof draftValue>(
        <ChaseColorsEditor
          colors={colors}
          members={state.members}
          initialIndex={initialIndex}
          isDraft={isDraft}
          onChange={value => (newColors = value)}
        />,
        [
          buttonOk,
          !isDraft &&
            ({
              label: 'Set as Draft',
              value: draftValue,
              icon: iconTime,
            } as const),
          buttonCancel,
        ].filter(isTruthy),
        { showCloseButton: true }
      )
      if (!result) return
      update(
        result === draftValue || isDraft
          ? { colorsDraft: newColors }
          : { colors: newColors }
      )
    }

    return (
      <Widget
        icon={iconChase}
        title={title}
        onTitleClick={() => update({ on: !state.on })}
        turnedOn={state.on}
        contentClassName={flexWrap}
        titleSide={
          <div className={controls}>
            <Button
              icon={iconSpeedBurst}
              title="Speed burst"
              transparent
              onDown={startSpeedBurst}
              onUp={stopSpeedBurst}
            />
            <Button
              icon={iconStep}
              title="Step"
              transparent
              onDown={() => setLiveChaseStep(id)}
            />
            <Button
              icon={iconDoubleSpeed}
              title="Double speed"
              transparent
              onDown={() => updateSpeed(Math.max(state.speed / 2, maxSpeed))}
            />
            <Button
              icon={iconHalfSpeed}
              title="Half speed"
              transparent
              onDown={() => updateSpeed(Math.min(state.speed * 2, minSpeed))}
            />
            &nbsp;&nbsp;
            <Button
              icon={iconSync}
              title="Tap Sync"
              transparent
              onDown={tapSync}
            />
            &nbsp;&nbsp;
            <Button
              icon={state.stopped ? iconStop : iconStart}
              title={state.stopped ? 'Start' : 'Stop'}
              iconColor={state.stopped ? errorShade(0) : successShade(0)}
              transparent
              className={state.stopped || !state.on ? undefined : activeButton}
              onDown={() =>
                update({
                  stopped: !state.stopped,
                  on: state.on || !!state.stopped,
                })
              }
            />
          </div>
        }
      >
        <div className={leftColumn}>
          <FixtureListInput
            value={state.members}
            onChange={members => update({ members })}
            ordering
            compact
          />
        </div>
        <div className={rightColumn}>
          <div className={faderContainer}>
            <div className={colorContainer}>
              {state.colors.map((color, index) => (
                <div
                  key={index}
                  className={colorStyle}
                  style={{
                    background: getChasePreviewColor(color),
                  }}
                  onClick={() =>
                    openColorDialog({
                      colors: state.colors,
                      initialIndex: index,
                    })
                  }
                >
                  {state.colors.length > 1 && state.colors.length < 4 && (
                    <Button
                      icon={iconDelete}
                      title="Remove Color"
                      transparent
                      onClick={event => {
                        event?.stopPropagation()
                        return update({
                          colors: state.colors.filter(it => it !== color),
                        })
                      }}
                    />
                  )}
                </div>
              ))}
              <Button
                icon={iconAdd}
                transparent
                onClick={() =>
                  openColorDialog({
                    colors: [
                      ...state.colors,
                      {
                        channels: {
                          [ChannelType.Master]: 255,
                          [ChannelType.Red]: 255,
                        },
                      },
                    ],
                    initialIndex: state.colors.length,
                  })
                }
              />
            </div>
            {state.colorsDraft && (
              <div className={cx(colorContainer, draftContainer)}>
                {state.colorsDraft.map((color, index) => (
                  <div
                    key={index}
                    className={colorStyle}
                    style={{
                      background: getChasePreviewColor(color),
                    }}
                    onClick={() =>
                      openColorDialog({
                        colors: state.colorsDraft ?? [],
                        initialIndex: index,
                        isDraft: true,
                      })
                    }
                  />
                ))}
                <Button
                  icon={iconOk}
                  transparent
                  title="Apply draft"
                  onClick={() =>
                    update({
                      colors: state.colorsDraft ?? [],
                      colorsDraft: null,
                    })
                  }
                />
              </div>
            )}
            <Fader
              max={255}
              step={1}
              value={state.value ?? 0}
              onChange={value => update({ value })}
              label="Value"
            />
            <Fader
              min={useFastMode ? fastMinSpeed : minSpeed}
              max={maxSpeed}
              value={state.speed}
              onChange={updateSpeed}
              label="Speed"
              subLabel={`${state.speed.toFixed(2)}s`}
            />
            <FaderWithContainer
              min={
                state.fadeLockedToSpeed
                  ? 100
                  : useFastMode
                  ? fastMinSpeed
                  : minSpeed
              }
              max={0}
              value={
                state.fadeLockedToSpeed
                  ? ((state.fade ?? 0) / state.speed) * 100
                  : state.fade ?? 0
              }
              onChange={value =>
                update({
                  fade: state.fadeLockedToSpeed
                    ? (value / 100) * state.speed
                    : value,
                })
              }
              label="Fade"
              subLabel={state.fade ? `${state.fade.toFixed(2)}s` : 'Instant'}
              bottomIcon={state.fadeLockedToSpeed ? iconPercentage : iconTime}
              onBottomIconClick={() =>
                update({ fadeLockedToSpeed: !state.fadeLockedToSpeed })
              }
            />
            <ValueOrRandomFader
              min={0}
              max={1}
              value={state.light}
              onChange={light => update({ light })}
              label="Light"
            />
          </div>
          <div>
            <Button
              icon={useFastMode ? iconFast : iconSlow}
              title="Toggle fast mode"
              transparent
              onClick={() => {
                if (!isCurrentlyFast) return
                setFastMode(!fastMode)
              }}
              disabled={!isCurrentlyFast}
            />
            <Button
              icon={state.single ? iconSingle : iconMultiple}
              title={
                state.single
                  ? 'Single Mode: Will turn off other single-mode chases when activated'
                  : 'Multiple Mode: Will run in addition to other chases'
              }
              transparent
              onClick={() => update({ single: !state.single })}
            />
            <Button
              icon={iconRename}
              title="Rename"
              transparent
              onClick={async () => {
                const name = await showPromptDialog({
                  title: 'Rename Live Chase',
                  label: 'Name',
                  initialValue: state.name,
                })
                if (name) {
                  update({ name })
                }
              }}
            />
            <Button
              icon={iconDelete}
              title="Delete"
              transparent
              onClick={async () => {
                if (await showDialog(`Delete Live Chase "${title}"?`, yesNo)) {
                  deleteLiveChase(id)
                }
              }}
            />
          </div>
        </div>
      </Widget>
    )
  }
)
