import { Memory } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { WidgetPassthrough } from '../../ui/containers/widget'
import { memoInProduction } from '../../util/development'

import { StatelessMemoryWidget } from './stateless-memory-widget'

export interface MemoryWidgetProps extends WidgetPassthrough {
  memory: Memory
}

/**
 * Widget to display a memory.
 */
export const MemoryWidget = memoInProduction(
  ({ memory, ...passThrough }: MemoryWidgetProps) => {
    const memoryState = useApiStateEntry('memories', memory.id)

    if (!memoryState) {
      return null
    }

    return (
      <StatelessMemoryWidget
        memory={memory}
        state={memoryState}
        {...passThrough}
      />
    )
  }
)
