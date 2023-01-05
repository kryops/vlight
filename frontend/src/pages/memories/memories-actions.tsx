import { Link } from 'react-router-dom'

import { setLiveMemoryState, setMemoryState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconAdd, iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { openEntityEditor } from '../config/entities/editors'
import { HotkeyContext } from '../../hooks/hotkey'

/**
 * Corner actions for the memories page:
 * - Add memory
 * - Configure
 * - All on
 * - All off
 */
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
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconAdd}
        transparent
        onClick={() => openEntityEditor('memories')}
      />
      <Link to={entitiesPageRoute('memories')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onClick={() => setOnForAllMemories(true)}
        disabled={isAllOn(memoriesState) && isAllOn(liveMemoriesState)}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllMemories(false)}
        disabled={!isAnyOn(memoriesState) && !isAnyOn(liveMemoriesState)}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
}
