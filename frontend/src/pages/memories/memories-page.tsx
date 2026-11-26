import { useApiStateSelector, useMasterData } from '../../hooks/api'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'
import { Header } from '../../ui/containers/header'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { useSearch } from '../../hooks/search'
import { SearchToggle } from '../../ui/components/search-toggle'
import { NoSearchResults } from '../../ui/components/no-search-results'
import { getLiveMemoryTitle } from '../../util/entities'

import { MemoriesActions } from './memories-actions'
import { MemoriesMultiControl } from './memories-multi-control'
import { LiveMemories } from './live-memories'

/**
 * Memories page.
 *
 * Displays:
 * - a multi-control widget
 * - widgets for all configured memories
 * - live memories
 */
const MemoriesPage = () => {
  const { memories: allMemories } = useMasterData()
  const search = useSearch()

  const memories = search.active
    ? allMemories.filter(memory => search.matches(memory.name ?? memory.id))
    : allMemories

  const liveMemoriesCount = useApiStateSelector(
    apiState =>
      Object.entries(apiState.liveMemories).filter(([id, liveMemory]) =>
        search.matches(getLiveMemoryTitle(id, liveMemory))
      ).length,
    { event: 'liveMemories' }
  )
  const activeHotkeyIndex = useNumberHotkey(
    memories.length + liveMemoriesCount,
    search.query
  )

  return (
    <>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <MemoriesActions />
          </>
        }
      >
        Memories
      </Header>
      <MemoriesMultiControl />
      <div className={pageWithWidgets}>
        {memories.map((memory, index) => (
          <MemoryWidget
            key={memory.id}
            memory={memory}
            cornerLabel={getHotkeyLabel(index)}
            hotkeysActive={activeHotkeyIndex === index}
          />
        ))}
      </div>
      {search.active && memories.length === 0 && <NoSearchResults />}
      <LiveMemories
        search={search}
        startHotkeyIndex={memories.length}
        activeHotkeyIndex={
          activeHotkeyIndex !== null && activeHotkeyIndex >= memories.length
            ? activeHotkeyIndex - memories.length
            : null
        }
      />
    </>
  )
}

export default MemoriesPage
