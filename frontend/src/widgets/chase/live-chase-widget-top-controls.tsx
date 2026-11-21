import { IdType, LiveChase } from '@vlight/types'

import { setLiveChaseState, setLiveChaseStep } from '../../api'
import {
  iconDoubleSpeed,
  iconFullView,
  iconHalfSpeed,
  iconSpeedBurst,
  iconStep,
  iconSync,
} from '../../ui/icons'
import { Button } from '../../ui/buttons/button'
import { useTapSync } from '../../hooks/speed'
import { widgetTitleControls } from '../../ui/css/widget-controls'
import { StartStopButton } from '../start-stop-button'

import { getLiveChaseSpeedChange } from './utils'
import { useSpeedBurst } from './use-speed-burst'
import { liveChaseMaxSpeed, liveChaseMinSpeed } from './constants'

export interface LiveChaseWidgetTopControlsProps {
  id: IdType
  state: LiveChase

  /** See `onChange` of the `StatelessLiveChaseWidget`. */
  onChange?: (newState: Partial<LiveChase>) => void
}

/**
 * Component to render the top control buttons for a live chase
 */
export const LiveChaseWidgetTopControls = ({
  id,
  state,
  onChange,
}: LiveChaseWidgetTopControlsProps) => {
  const update =
    onChange ??
    ((newState: Partial<LiveChase>) => setLiveChaseState(id, newState, true))

  const updateSpeed = (speed: number) =>
    update(getLiveChaseSpeedChange(state, speed))

  const { startSpeedBurst, stopSpeedBurst } = useSpeedBurst(id, state)

  const tapSync = useTapSync(updateSpeed)

  const step = () => setLiveChaseStep(id)

  const doubleSpeed = () =>
    updateSpeed(Math.max(state.speed / 2, liveChaseMaxSpeed))

  const halfSpeed = () =>
    updateSpeed(Math.min(state.speed * 2, liveChaseMinSpeed))

  const toggleStartStop = () =>
    update({
      stopped: !state.stopped,
      on: state.on || !!state.stopped,
    })

  const start = () => update({ stopped: false, on: true })

  if (state.compact && !onChange) {
    return (
      <div className={widgetTitleControls}>
        <Button
          icon={iconFullView}
          title="Full view"
          transparent
          onClick={() => update({ compact: false })}
        />
      </div>
    )
  }

  return (
    <div className={widgetTitleControls}>
      {!onChange && (
        <>
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
            onDown={step}
            hotkey="c"
          />
        </>
      )}
      <Button
        icon={iconDoubleSpeed}
        title="Double speed"
        transparent
        onDown={doubleSpeed}
        hotkey="v"
      />
      <Button
        icon={iconHalfSpeed}
        title="Half speed"
        transparent
        onDown={halfSpeed}
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
      <StartStopButton
        started={!state.stopped}
        on={state.on}
        onToggle={toggleStartStop}
        onStart={start}
        hotkey="m"
        ignorePause={!!onChange}
      />
    </div>
  )
}
