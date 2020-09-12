import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'

const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  return (
    <div className={pageWithWidgets}>
      {memories.map(memory => (
        <MemoryWidget key={memory.id} memory={memory} />
      ))}
    </div>
  )
})

export default MemoriesPage
