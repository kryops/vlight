import { IdType } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { WidgetPassthrough } from '../../ui/containers/widget'
import { getLiveMemoryTitle } from '../../util/entities'

import { StatelessLiveMemoryWidget } from './stateless-live-memory-widget'

export interface LiveMemoryWidgetProps extends WidgetPassthrough {
  id: IdType
  title?: string
}

/**
 * Widget to display a live memory.
 */
export const LiveMemoryWidget = ({
  id,
  title,
  ...passThrough
}: LiveMemoryWidgetProps) => {
  const liveMemoryState = useApiStateEntry('liveMemories', id)

  if (!liveMemoryState) {
    return null
  }

  return (
    <StatelessLiveMemoryWidget
      id={id}
      state={liveMemoryState}
      title={title ?? getLiveMemoryTitle(id, liveMemoryState)}
      {...passThrough}
    />
  )
}
