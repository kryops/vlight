import { IdType } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { WidgetPassthrough } from '../../ui/containers/widget'

import { StatelessLiveChaseWidget } from './stateless-live-chase-widget'

export interface LiveChaseWidgetProps extends WidgetPassthrough {
  id: IdType
  title?: string
}

/**
 * Widget to display a live chase.
 */
export const LiveChaseWidget = ({
  id,
  title,
  ...passThrough
}: LiveChaseWidgetProps) => {
  const liveChaseState = useApiStateEntry('liveChases', id)

  if (!liveChaseState) {
    return null
  }

  return (
    <StatelessLiveChaseWidget
      id={id}
      state={liveChaseState}
      title={title ?? liveChaseState.name ?? `Live Chase ${id}`}
      {...passThrough}
    />
  )
}
