import { setLiveChaseState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { HotkeyContext } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'
import { apiState } from '../../api/api-state'

function setOnForAllChases(on: boolean) {
  Object.entries(apiState.liveChases).forEach(([id, liveChase]) => {
    if (liveChase.on !== on) {
      setLiveChaseState(id, { on }, true)
    }
  })
}

const turnAllOn = () => setOnForAllChases(true)
const turnAllOff = () => setOnForAllChases(false)

/**
 * Corner actions for the chases page:
 * - All on
 * - All off
 */
export const ChasesActions = memoInProduction(() => {
  const { allOn, allOff } = useApiStateSelector(
    apiState => ({
      allOn: isAllOn(apiState.liveChases),
      allOff: !isAnyOn(apiState.liveChases),
    }),
    { event: 'liveChases' }
  )

  return (
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconLight}
        onClick={turnAllOn}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllOff}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
})
