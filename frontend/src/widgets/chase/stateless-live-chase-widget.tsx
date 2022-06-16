import { ChaseColor, IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { useEffect, useRef, useState } from 'react'
import { ensureBetween } from '@vlight/utils'

import { deleteLiveChase, setLiveChaseState, setLiveChaseStep } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexWrap } from '../../ui/css/flex'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import {
  iconAdd,
  iconDelete,
  iconDoubleSpeed,
  iconFast,
  iconHalfSpeed,
  iconLocked,
  iconMultiple,
  iconSingle,
  iconSlow,
  iconSpeedBurst,
  iconStart,
  iconStep,
  iconStop,
  iconSync,
  iconUnlocked,
} from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline, errorShade, successShade } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { showDialog, showDialogWithReturnValue } from '../../ui/overlays/dialog'
import { okCancel, yesNo } from '../../ui/overlays/buttons'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { Button } from '../../ui/buttons/button'
import { useTapSync } from '../../hooks/speed'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'

import { getChasePreviewColor } from './utils'
import { ChaseColorEditor } from './chase-color-editor'

const maxSpeed = 0.025
const fastMinSpeed = 2
const minSpeed = 5

const leftColumn = css`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const rightColumn = css`
  flex: 1 1 auto;
`

const colorContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
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

export interface StatelessLiveChaseWidgetProps {
  id: IdType
  state: LiveChase
  title?: string
}

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

    const speedBurstBackup = useRef<Partial<LiveChase>>({})
    const startSpeedBurst = () => {
      speedBurstBackup.current = {
        speed: state.speed,
        fade: state.fade,
        stopped: state.stopped,
        on: state.on,
        burst: false,
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
      update(speedBurstBackup.current)
      // If the chase was fading before, this will trigger an additional step to start fading again immediately
      setLiveChaseStep(id)
    }

    return (
      <Widget
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
            <Button
              icon={iconSync}
              title="Tap Sync"
              transparent
              onDown={tapSync}
            />
            <Button
              icon={state.stopped ? iconStop : iconStart}
              title={state.stopped ? 'Start' : 'Stop'}
              iconColor={state.stopped ? errorShade(0) : successShade(0)}
              transparent
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
                  onClick={async () => {
                    const result =
                      await showDialogWithReturnValue<ChaseColor | null>(
                        (onChange, onClose) => (
                          <ChaseColorEditor
                            members={state.members}
                            color={color}
                            onChange={onChange}
                            onClose={onClose}
                          />
                        ),
                        okCancel,
                        { showCloseButton: true }
                      )
                    if (result === undefined) return

                    update({
                      colors:
                        result === null
                          ? state.colors.filter(it => it !== color)
                          : state.colors.map(it =>
                              it === color ? result : it
                            ),
                    })
                  }}
                >
                  {state.colors.length < 4 && (
                    <Button
                      icon={iconDelete}
                      title="Remove Color"
                      transparent
                      onDown={() =>
                        update({
                          colors: state.colors.filter(it => it !== color),
                        })
                      }
                    />
                  )}
                </div>
              ))}
              <Icon
                icon={iconAdd}
                hoverable
                onClick={async () => {
                  const result =
                    await showDialogWithReturnValue<ChaseColor | null>(
                      onChange => (
                        <ChaseColorEditor
                          members={state.members}
                          onChange={onChange}
                        />
                      ),
                      okCancel,
                      { showCloseButton: true }
                    )
                  if (!result) return
                  update({ colors: [...state.colors, result] })
                }}
              />
            </div>
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
              min={useFastMode ? fastMinSpeed : minSpeed}
              max={0}
              value={state.fade ?? 0}
              onChange={fade => update({ fade })}
              label="Fade"
              subLabel={state.fade ? `${state.fade.toFixed(2)}s` : 'Instant'}
              bottomIcon={state.fadeLockedToSpeed ? iconLocked : iconUnlocked}
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
              icon={iconDelete}
              title="Delete"
              transparent
              onClick={async () => {
                if (await showDialog('Delete Live Chase?', yesNo)) {
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
