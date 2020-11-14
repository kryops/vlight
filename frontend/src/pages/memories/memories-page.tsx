import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'
import { Header } from '../../ui/containers/header'

import { MemoriesActions } from './memories-actions'
import { MemoriesMultiControl } from './memories-multi-control'
import { LiveMemories } from './live-memories'

const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  return (
    <>
      <Header rightContent={<MemoriesActions />}>Memories</Header>
      <MemoriesMultiControl />
      <div className={pageWithWidgets}>
        {memories.map(memory => (
          <MemoryWidget key={memory.id} memory={memory} />
        ))}
      </div>
      <LiveMemories />
    </>
  )
})

export default MemoriesPage
