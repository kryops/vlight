import { setPaused } from '../api'
import { useApiState } from '../hooks/api'
import { Button } from '../ui/buttons/button'
import { activeButton } from '../ui/css/widget-controls'
import { iconPause, iconStart, iconStop } from '../ui/icons'
import { errorShade, successShade, warnShade } from '../ui/styles'

export interface StartStopButtonProps {
  /** Whether the control is started (independent from it being turned on). */
  started: boolean

  /** Whether the control is turned on. */
  on: boolean

  /** Toggles between started and stopped. */
  onToggle: () => void

  /**
   * Starts the control (and turns it on).
   * Called when resuming from the global pause.
   */
  onStart: () => void

  startTitle?: string
  stopTitle?: string

  hotkey?: string

  /**
   * If set, the global pause state is ignored.
   *
   * Defaults to `false`.
   */
  ignorePause?: boolean
}

/**
 * Button to start/stop a continuously running control, e.g. a live chase.
 *
 * While all controls are globally paused, it displays a pause icon instead.
 * Clicking on it resumes globally and starts the control.
 */
export const StartStopButton = ({
  started,
  on,
  onToggle,
  onStart,
  startTitle = 'Start',
  stopTitle = 'Stop',
  hotkey,
  ignorePause = false,
}: StartStopButtonProps) => {
  const paused = useApiState('paused')

  if (paused && !ignorePause) {
    const resume = () => {
      setPaused(false)
      onStart()
    }

    return (
      <Button
        icon={iconPause}
        title="Paused globally - resume and start"
        iconColor={warnShade(0)}
        transparent
        onDown={resume}
        hotkey={hotkey}
      />
    )
  }

  return (
    <Button
      icon={started ? iconStart : iconStop}
      title={started ? stopTitle : startTitle}
      iconColor={started ? successShade(0) : errorShade(0)}
      transparent
      className={started && on ? activeButton : undefined}
      onDown={onToggle}
      hotkey={hotkey}
    />
  )
}
