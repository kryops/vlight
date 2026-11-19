import { setLiveChaseState, setLiveMovementState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff, iconStop } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { HotkeyContext } from '../../hooks/hotkey'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'

function setOnForAllChases(on: boolean) {
  Object.entries(apiState.liveChases).forEach(([id, liveChase]) => {
    if (liveChase.on !== on) {
      setLiveChaseState(id, { on }, true)
    }
  })
  Object.entries(apiState.liveMovements).forEach(([id, liveMovement]) => {
    if (liveMovement.on !== on) {
      setLiveMovementState(id, { on }, true)
    }
  })
}

export function stopAllChases() {
  Object.entries(apiState.liveChases).forEach(([id, liveChase]) => {
    if (!liveChase.stopped) {
      setLiveChaseState(id, { stopped: true }, true)
    }
  })
  Object.entries(apiState.liveMovements).forEach(([id, liveMovement]) => {
    if (!liveMovement.stopped) {
      setLiveMovementState(id, { stopped: true }, true)
    }
  })
}

export function isAnyChaseOn(apiState: ApiState) {
  return isAnyOn(apiState.liveChases) || isAnyOn(apiState.liveMovements)
}

export function isAnyChaseRunning(apiState: ApiState) {
  return (
    Object.values(apiState.liveChases).some(liveChase => !liveChase.stopped) ||
    Object.values(apiState.liveMovements).some(
      liveMovement => liveMovement.on && !liveMovement.stopped
    )
  )
}

export const turnAllChasesOn = () => setOnForAllChases(true)
export const turnAllChasesOff = () => setOnForAllChases(false)

/**
 * Corner actions for the chases page:
 * - All on
 * - All off
 */
export const ChasesActions = () => {
  const { allOn, allOff, allStopped } = useApiStateSelector(apiState => ({
    allOn: isAllOn(apiState.liveChases) && isAllOn(apiState.liveMovements),
    allOff: !isAnyChaseOn(apiState),
    allStopped: !isAnyChaseRunning(apiState),
  }))

  return (
    <HotkeyContext value={true}>
      <Button
        icon={iconStop}
        onClick={stopAllChases}
        disabled={allStopped}
        title="Stop"
        hotkey="i"
      >
        STOP
      </Button>
      <Button
        icon={iconLight}
        onClick={turnAllChasesOn}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllChasesOff}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext>
  )
}
