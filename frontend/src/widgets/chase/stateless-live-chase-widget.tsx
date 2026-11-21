import { IdType, LiveChase, ValueOrRandom } from '@vlight/types'
import { css } from '@linaria/core'

import { setLiveChaseState } from '../../api'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import {
  iconChase,
  iconPercentage,
  iconSpeedBurst,
  iconTime,
} from '../../ui/icons'
import { Button } from '../../ui/buttons/button'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'
import { useDeepEqualMemo } from '../../hooks/performance'
import { cx } from '../../util/styles'

import { LiveChaseWidgetColorControls } from './live-chase-widget-color-controls'
import { getLiveChaseSpeedChange } from './utils'
import {
  liveChaseFaderQuadraticScale,
  liveChaseMaxSpeed,
  liveChaseMinSpeed,
} from './constants'
import { LiveChaseWidgetTopControls } from './live-chase-widget-top-controls'
import { LiveChaseWidgetBottomControls } from './live-chase-widget-bottom-controls'
import { useSpeedBurst } from './use-speed-burst'

const container = css`
  padding-bottom: 0;
`

const compactContainer = css`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
`

export interface StatelessLiveChaseWidgetProps extends WidgetPassthrough {
  id: IdType
  state: LiveChase
  title?: string

  /**
   * If set, state changes are passed to this callback instead of being sent
   * to the backend (e.g. to edit actions).
   *
   * Controls that cannot be expressed as state changes (e.g. step, speed burst, delete)
   * are hidden, and the compact view is ignored.
   */
  onChange?: (newState: Partial<LiveChase>) => void
}

/**
 * Stateless widget to display a live chase.
 */
export const StatelessLiveChaseWidget = ({
  id,
  state,
  title,
  onChange,
  ...passThrough
}: StatelessLiveChaseWidgetProps) => {
  const update =
    onChange ??
    ((newState: Partial<LiveChase>) => setLiveChaseState(id, newState, true))

  const changeSpeed = (speed: number) =>
    update(getLiveChaseSpeedChange(state, speed))

  const changeValue = (value: number) => update({ value })

  const changeFadeTime = (value: number) =>
    update({
      fade: state.fadeLockedToSpeed ? (value / 100) * state.speed : value,
    })

  const toggleFadeLockedToSpeed = () =>
    update({ fadeLockedToSpeed: !state.fadeLockedToSpeed })

  const light = useDeepEqualMemo(state.light)

  const changeLight = (light: ValueOrRandom<number>) => update({ light })

  const onTitleClick = () => update({ on: !state.on })

  const { startSpeedBurst, stopSpeedBurst } = useSpeedBurst(id, state)

  return (
    <Widget
      icon={iconChase}
      title={title}
      onTitleClick={onTitleClick}
      turnedOn={state.on}
      contentClassName={flexWrap}
      titleSide={
        <LiveChaseWidgetTopControls id={id} state={state} onChange={onChange} />
      }
      {...passThrough}
    >
      {state.compact && !onChange ? (
        <div className={compactContainer}>
          <Button
            icon={iconSpeedBurst}
            iconSize={18}
            title="Speed burst"
            transparent
            onDown={startSpeedBurst}
            onUp={stopSpeedBurst}
            hotkey="x"
          />
        </div>
      ) : (
        <div className={flexAuto}>
          <div className={cx(faderContainer, container)}>
            <LiveChaseWidgetColorControls
              id={id}
              state={state}
              onChange={onChange}
            />

            <Fader
              max={255}
              step={1}
              value={state.value ?? 0}
              onChange={changeValue}
              label="Value"
            />
            <Fader
              min={liveChaseMinSpeed}
              max={liveChaseMaxSpeed}
              quadraticScale={liveChaseFaderQuadraticScale}
              value={state.speed}
              onChange={changeSpeed}
              label="Speed"
              subLabel={`${state.speed.toFixed(2)}s`}
            />
            <FaderWithContainer
              min={state.fadeLockedToSpeed ? 100 : liveChaseMinSpeed}
              max={0}
              quadraticScale={
                state.fadeLockedToSpeed
                  ? undefined
                  : liveChaseFaderQuadraticScale
              }
              value={
                state.fadeLockedToSpeed
                  ? ((state.fade ?? 0) / state.speed) * 100
                  : (state.fade ?? 0)
              }
              onChange={changeFadeTime}
              label="Fade"
              subLabel={state.fade ? `${state.fade.toFixed(2)}s` : 'Instant'}
              bottomIcon={state.fadeLockedToSpeed ? iconPercentage : iconTime}
              bottomIconTitle={
                state.fadeLockedToSpeed
                  ? 'Fade relative to speed (click for absolute)'
                  : 'Absolute fade time (click for relative to speed)'
              }
              onBottomIconClick={toggleFadeLockedToSpeed}
            />
            <ValueOrRandomFader
              min={0}
              max={1}
              value={light}
              onChange={changeLight}
              label="Light"
            />
          </div>

          <LiveChaseWidgetBottomControls
            id={id}
            state={state}
            title={title}
            onChange={onChange}
          />
        </div>
      )}
    </Widget>
  )
}
