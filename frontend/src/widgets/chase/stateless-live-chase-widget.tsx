import { IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { useEffect, useState } from 'react'

import { setLiveChaseState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { iconChase, iconPercentage, iconTime } from '../../ui/icons'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'

import { LiveChaseWidgetColorControls } from './live-chase-widget-color-controls'
import { isLiveChaseCurrentlyFast, updateLiveChaseSpeed } from './utils'
import {
  liveChaseFastMinSpeed,
  liveChaseMaxSpeed,
  liveChaseMinSpeed,
} from './constants'
import { LiveChaseWidgetTopControls } from './live-chase-widget-top-controls'
import { LiveChaseWidgetBottomControls } from './live-chase-widget-bottom-controls'

const leftColumn = css`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const rightColumn = flexAuto

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

    const updateSpeed = (speed: number) =>
      updateLiveChaseSpeed(id, state, speed)

    const isCurrentlyFast = isLiveChaseCurrentlyFast(state)
    const [fastMode, setFastMode] = useState(isCurrentlyFast)
    const useFastMode = fastMode && isCurrentlyFast

    useEffect(() => {
      if (!isCurrentlyFast) setFastMode(false)
    }, [isCurrentlyFast])

    return (
      <Widget
        icon={iconChase}
        title={title}
        onTitleClick={() => update({ on: !state.on })}
        turnedOn={state.on}
        contentClassName={flexWrap}
        titleSide={<LiveChaseWidgetTopControls id={id} state={state} />}
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
            <LiveChaseWidgetColorControls id={id} state={state} />

            <Fader
              max={255}
              step={1}
              value={state.value ?? 0}
              onChange={value => update({ value })}
              label="Value"
            />
            <Fader
              min={useFastMode ? liveChaseFastMinSpeed : liveChaseMinSpeed}
              max={liveChaseMaxSpeed}
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
                  ? liveChaseFastMinSpeed
                  : liveChaseMinSpeed
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

          <LiveChaseWidgetBottomControls
            id={id}
            state={state}
            title={title}
            onToggleFastMode={() => setFastMode(!fastMode)}
            useFastMode={useFastMode}
          />
        </div>
      </Widget>
    )
  }
)
