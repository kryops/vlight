import { setLiveChaseState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiState } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { HotkeyContext } from '../../hooks/hotkey'

/**
 * Corner actions for the chases page:
 * - All on
 * - All off
 */
export function ChasesActions() {
  const liveChasesState = useApiState('liveChases')

  function setOnForAllChases(on: boolean) {
    Object.entries(liveChasesState).forEach(([id, liveChase]) => {
      if (liveChase.on !== on) {
        setLiveChaseState(id, { on }, true)
      }
    })
  }

  return (
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconLight}
        onClick={() => setOnForAllChases(true)}
        disabled={isAllOn(liveChasesState)}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllChases(false)}
        disabled={!isAnyOn(liveChasesState)}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
}
