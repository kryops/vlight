import { IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { useRef } from 'react'

import { setLiveChaseState, setLiveChaseStep } from '../../api'
import {
  iconDoubleSpeed,
  iconHalfSpeed,
  iconSpeedBurst,
  iconStart,
  iconStep,
  iconStop,
  iconSync,
} from '../../ui/icons'
import { baseline, errorShade, successShade } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { Button } from '../../ui/buttons/button'
import { apiState } from '../../api/api-state'
import { useTapSync } from '../../hooks/speed'

import { updateLiveChaseSpeed } from './utils'
import { liveChaseMaxSpeed, liveChaseMinSpeed } from './constants'

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
`

export interface LiveChaseWidgetTopControlsProps {
  id: IdType
  state: LiveChase
}

/**
 * Component to render the top control buttons for a live chase
 */
export const LiveChaseWidgetTopControls = memoInProduction(
  ({ id, state }: LiveChaseWidgetTopControlsProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)

    const updateSpeed = (speed: number) =>
      updateLiveChaseSpeed(id, state, speed)

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
        speed: liveChaseMaxSpeed,
        fade: 0,
        stopped: false,
        on: true,
        burst: true,
      })
    }

    const stopSpeedBurst = () => {
      const { otherChases, ...chaseState } = speedBurstBackup.current
      update({ ...chaseState, burst: false })
      // If the chase was fading before, this will trigger an additional step to start fading again immediately
      setLiveChaseStep(id)
      otherChases?.forEach(chase =>
        setLiveChaseState(chase, { on: true }, true)
      )
    }

    const tapSync = useTapSync(updateSpeed)

    return (
      <div className={controls}>
        <Button
          icon={iconSpeedBurst}
          title="Speed burst"
          transparent
          onDown={startSpeedBurst}
          onUp={stopSpeedBurst}
          hotkey="x"
        />
        <Button
          icon={iconStep}
          title="Step"
          transparent
          onDown={() => setLiveChaseStep(id)}
          hotkey="c"
        />
        <Button
          icon={iconDoubleSpeed}
          title="Double speed"
          transparent
          onDown={() =>
            updateSpeed(Math.max(state.speed / 2, liveChaseMaxSpeed))
          }
          hotkey="v"
        />
        <Button
          icon={iconHalfSpeed}
          title="Half speed"
          transparent
          onDown={() =>
            updateSpeed(Math.min(state.speed * 2, liveChaseMinSpeed))
          }
          hotkey="b"
        />
        &nbsp;&nbsp;
        <Button
          icon={iconSync}
          title="Tap Sync"
          transparent
          onDown={tapSync}
          hotkey="n"
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
          hotkey="m"
        />
      </div>
    )
  }
)
