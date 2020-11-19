import { setLiveChaseState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiState } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'

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
    <>
      <Button
        icon={iconLight}
        onDown={() => setOnForAllChases(true)}
        disabled={isAllOn(liveChasesState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setOnForAllChases(false)}
        disabled={!isAnyOn(liveChasesState)}
      >
        OFF
      </Button>
    </>
  )
}
