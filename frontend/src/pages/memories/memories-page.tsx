import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { pageWithWidgets } from '../../ui/css/page'
import { MemoryWidget } from '../../widgets/memory/memory-widget'
import { Header } from '../../ui/containers/header'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { setMemoryState } from '../../api'

const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  function setOnForAllMemories(on: boolean) {
    setMemoryState(
      memories.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Header
        rightContent={
          <>
            <Button icon={iconLight} onDown={() => setOnForAllMemories(true)}>
              ON
            </Button>
            <Button
              icon={iconLightOff}
              onDown={() => setOnForAllMemories(false)}
            >
              OFF
            </Button>
          </>
        }
      >
        Memories
      </Header>
      <div className={pageWithWidgets}>
        {memories.map(memory => (
          <MemoryWidget key={memory.id} memory={memory} />
        ))}
      </div>
    </>
  )
})

export default MemoriesPage
