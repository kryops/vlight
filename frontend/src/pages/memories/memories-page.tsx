import { useApiStateSelector, useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'
import { Header } from '../../ui/containers/header'
import { useNumberHotkey } from '../../hooks/hotkey'

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
const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  const liveMemoriesCount = useApiStateSelector(
    apiState => Object.keys(apiState.liveMemories).length
  )
  const activeHotkeyIndex = useNumberHotkey(memories.length + liveMemoriesCount)

  return (
    <>
      <Header rightContent={<MemoriesActions />}>Memories</Header>
      <MemoriesMultiControl />
      <div className={pageWithWidgets}>
        {memories.map((memory, index) => (
          <MemoryWidget
            key={memory.id}
            memory={memory}
            hotkeysActive={activeHotkeyIndex === index}
          />
        ))}
      </div>
      <LiveMemories
        activeHotkeyIndex={
          activeHotkeyIndex !== null && activeHotkeyIndex >= memories.length
            ? activeHotkeyIndex - memories.length
            : null
        }
      />
    </>
  )
})

export default MemoriesPage
