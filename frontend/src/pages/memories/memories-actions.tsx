import { Link } from 'react-router-dom'

import { setLiveMemoryState, setMemoryState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconAdd, iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { openEntityEditor } from '../config/entities/editors'
import { HotkeyContext } from '../../hooks/hotkey'
import { apiState } from '../../api/api-state'

/**
 * Corner actions for the memories page:
 * - Add memory
 * - Configure
 * - All on
 * - All off
 */
export function MemoriesActions() {
  const { allOn, allOff } = useApiStateSelector(apiState => ({
    allOn: isAllOn(apiState.memories) && isAllOn(apiState.liveMemories),
    allOff: !isAnyOn(apiState.memories) && !isAnyOn(apiState.liveMemories),
  }))

  function setOnForAllMemories(on: boolean) {
    setMemoryState(
      apiState.masterData!.memories.map(it => it.id),
      { on },
      true
    )
    Object.entries(apiState.liveMemories).forEach(([id, liveMemory]) => {
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
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllMemories(false)}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
}
