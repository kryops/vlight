import { css } from 'linaria'
import React from 'react'

import { useMasterData } from '../../hooks/api'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { MemoryWidget } from '../../widgets/memory'

const memoriesPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baselinePx}px;
  /* to allow scrolling */
  margin-right: ${baselinePx * 8}px;

  ${flexEndSpacer}
`

const MemoriesPage = memoInProduction(() => {
  const { memories } = useMasterData()

  return (
    <div className={memoriesPage}>
      {memories.map(memory => (
        <MemoryWidget key={memory.id} memory={memory} />
      ))}
    </div>
  )
})

export default MemoriesPage
