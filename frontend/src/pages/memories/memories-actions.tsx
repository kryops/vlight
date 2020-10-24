import { Link } from 'react-router-dom'

import { setMemoryState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'

export function MemoriesActions() {
  const { memories } = useMasterData()
  const memoriesState = useApiState('memories')

  function setOnForAllmemories(on: boolean) {
    setMemoryState(
      memories.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Link to={entitiesPageRoute('memories')}>
        <Button icon={iconConfig} />
      </Link>
      <Button
        icon={iconLight}
        onDown={() => setOnForAllmemories(true)}
        disabled={isAllOn(memoriesState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setOnForAllmemories(false)}
        disabled={!isAnyOn(memoriesState)}
      >
        OFF
      </Button>
    </>
  )
}
