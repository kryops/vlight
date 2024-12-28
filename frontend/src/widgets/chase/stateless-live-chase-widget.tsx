import { IdType, LiveChase, ValueOrRandom } from '@vlight/types'
import { css } from '@linaria/core'

import { setLiveChaseState } from '../../api'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import { iconChase, iconPercentage, iconTime } from '../../ui/icons'
import { memoInProduction } from '../../util/development'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'
import { useEvent } from '../../hooks/performance'
import { cx } from '../../util/styles'

import { LiveChaseWidgetColorControls } from './live-chase-widget-color-controls'
import { updateLiveChaseSpeed } from './utils'
import {
  liveChaseFaderQuadraticScale,
  liveChaseMaxSpeed,
  liveChaseMinSpeed,
} from './constants'
import { LiveChaseWidgetTopControls } from './live-chase-widget-top-controls'
import { LiveChaseWidgetBottomControls } from './live-chase-widget-bottom-controls'

const container = css`
  padding-bottom: 0;
`

export interface StatelessLiveChaseWidgetProps extends WidgetPassthrough {
  id: IdType
  state: LiveChase
  title?: string
}

/**
 * Stateless widget to display a live chase.
 */
export const StatelessLiveChaseWidget = memoInProduction(
  ({ id, state, title, ...passThrough }: StatelessLiveChaseWidgetProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)

    const changeSpeed = useEvent((speed: number) =>
      updateLiveChaseSpeed(id, state, speed)
    )

    const changeValue = useEvent((value: number) => update({ value }))

    const changeFadeTime = useEvent((value: number) =>
      update({
        fade: state.fadeLockedToSpeed ? (value / 100) * state.speed : value,
      })
    )

    const toggleFadeLockedToSpeed = useEvent(() =>
      update({ fadeLockedToSpeed: !state.fadeLockedToSpeed })
    )

    const changeLight = useEvent((light: ValueOrRandom<number>) =>
      update({ light })
    )

    return (
      <Widget
        icon={iconChase}
        title={title}
        onTitleClick={() => update({ on: !state.on })}
        turnedOn={state.on}
        contentClassName={flexWrap}
        titleSide={<LiveChaseWidgetTopControls id={id} state={state} />}
        {...passThrough}
      >
        <div className={flexAuto}>
          <div className={cx(faderContainer, container)}>
            <LiveChaseWidgetColorControls id={id} state={state} />

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
              onBottomIconClick={toggleFadeLockedToSpeed}
            />
            <ValueOrRandomFader
              min={0}
              max={1}
              value={state.light}
              onChange={changeLight}
              label="Light"
            />
          </div>

          <LiveChaseWidgetBottomControls id={id} state={state} title={title} />
        </div>
      </Widget>
    )
  }
)
