import { IdType, LiveChase, ValueOrRandom } from '@vlight/types'
import { css } from '@linaria/core'
import { useEffect, useState } from 'react'

import { setLiveChaseState } from '../../api'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { iconChase, iconPercentage, iconTime } from '../../ui/icons'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { FaderWithContainer } from '../../ui/controls/fader/fader-with-container'
import { useEvent, useShallowEqualMemo } from '../../hooks/performance'

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

    const isCurrentlyFast = isLiveChaseCurrentlyFast(state)
    const [fastMode, setFastMode] = useState(isCurrentlyFast)
    const useFastMode = fastMode && isCurrentlyFast

    useEffect(() => {
      if (!isCurrentlyFast) setFastMode(false)
    }, [isCurrentlyFast])

    const members = useShallowEqualMemo(state.members)
    const changeMembers = useEvent((members: string[]) => update({ members }))

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

    const toggleFastMode = useEvent(() => setFastMode(!fastMode))

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
        <div className={leftColumn}>
          <FixtureListInput
            value={members}
            onChange={changeMembers}
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
              onChange={changeValue}
              label="Value"
            />
            <Fader
              min={useFastMode ? liveChaseFastMinSpeed : liveChaseMinSpeed}
              max={liveChaseMaxSpeed}
              value={state.speed}
              onChange={changeSpeed}
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

          <LiveChaseWidgetBottomControls
            id={id}
            state={state}
            title={title}
            onToggleFastMode={toggleFastMode}
            useFastMode={useFastMode}
          />
        </div>
      </Widget>
    )
  }
)
