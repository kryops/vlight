import { Memory } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { memoInProduction } from '../../util/development'

import { StatelessMemoryWidget } from './stateless-memory-widget'

export interface MemoryWidgetProps {
  memory: Memory
  hotkeysActive?: boolean
}

/**
 * Widget to display a memory.
 */
export const MemoryWidget = memoInProduction(
  ({ memory, hotkeysActive }: MemoryWidgetProps) => {
    const memoryState = useApiStateEntry('memories', memory.id)

    if (!memoryState) {
      return null
    }

    return (
      <StatelessMemoryWidget
        memory={memory}
        state={memoryState}
        hotkeysActive={hotkeysActive}
      />
    )
  }
)
