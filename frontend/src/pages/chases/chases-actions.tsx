import { setLiveChaseState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff, iconStop } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { HotkeyContext } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'

function setOnForAllChases(on: boolean) {
  Object.entries(apiState.liveChases).forEach(([id, liveChase]) => {
    if (liveChase.on !== on) {
      setLiveChaseState(id, { on }, true)
    }
  })
}

export function stopAllChases() {
  Object.entries(apiState.liveChases).forEach(([id, liveChase]) => {
    if (!liveChase.stopped) {
      setLiveChaseState(id, { stopped: true }, true)
    }
  })
}

export function isAnyChaseOn(apiState: ApiState) {
  return isAnyOn(apiState.liveChases)
}

export function isAnyChaseRunning(apiState: ApiState) {
  return Object.values(apiState.liveChases).some(
    liveChase => !liveChase.stopped
  )
}

export const turnAllChasesOn = () => setOnForAllChases(true)
export const turnAllChasesOff = () => setOnForAllChases(false)

/**
 * Corner actions for the chases page:
 * - All on
 * - All off
 */
export const ChasesActions = memoInProduction(() => {
  const { allOn, allOff, allStopped } = useApiStateSelector(
    apiState => ({
      allOn: isAllOn(apiState.liveChases),
      allOff: !isAnyChaseOn(apiState),
      allStopped: !isAnyChaseRunning(apiState),
    }),
    { event: 'liveChases' }
  )

  return (
    <HotkeyContext.Provider value={true}>
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
    </HotkeyContext.Provider>
  )
})
