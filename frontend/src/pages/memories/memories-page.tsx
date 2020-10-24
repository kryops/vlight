import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'
import { Header } from '../../ui/containers/header'

import { MemoriesActions } from './memories-actions'

const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  return (
    <>
      <Header rightContent={<MemoriesActions />}>Memories</Header>
      <div className={pageWithWidgets}>
        {memories.map(memory => (
          <MemoryWidget key={memory.id} memory={memory} />
        ))}
      </div>
    </>
  )
})

export default MemoriesPage
