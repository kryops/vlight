import { Link } from 'react-router-dom'

import { setLiveMemoryState, setMemoryState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'

export function MemoriesActions() {
  const { memories } = useMasterData()
  const memoriesState = useApiState('memories')
  const liveMemoriesState = useApiState('liveMemories')

  function setOnForAllMemories(on: boolean) {
    setMemoryState(
      memories.map(it => it.id),
      { on },
      true
    )
    Object.entries(liveMemoriesState).forEach(([id, liveMemory]) => {
      if (liveMemory.on !== on) {
        setLiveMemoryState(id, { on }, true)
      }
    })
  }

  return (
    <>
      <Link to={entitiesPageRoute('memories')}>
        <Button icon={iconConfig} />
      </Link>
      <Button
        icon={iconLight}
        onDown={() => setOnForAllMemories(true)}
        disabled={isAllOn(memoriesState) && isAllOn(liveMemoriesState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setOnForAllMemories(false)}
        disabled={!isAnyOn(memoriesState) && !isAnyOn(liveMemoriesState)}
      >
        OFF
      </Button>
    </>
  )
}
