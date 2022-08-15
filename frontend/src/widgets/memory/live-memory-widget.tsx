import { IdType } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { memoInProduction } from '../../util/development'

import { StatelessLiveMemoryWidget } from './stateless-live-memory-widget'

export interface LiveMemoryWidgetProps {
  id: IdType
  title?: string
}

/**
 * Widget to display a live memory.
 */
export const LiveMemoryWidget = memoInProduction(
  ({ id, title }: LiveMemoryWidgetProps) => {
    const liveMemoryState = useApiStateEntry('liveMemories', id)

    if (!liveMemoryState) {
      return null
    }

    return (
      <StatelessLiveMemoryWidget
        id={id}
        state={liveMemoryState}
        title={title}
      />
    )
  }
)
