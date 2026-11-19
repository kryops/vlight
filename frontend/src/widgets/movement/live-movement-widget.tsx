import { IdType } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'
import { WidgetPassthrough } from '../../ui/containers/widget'

import { StatelessLiveMovementWidget } from './stateless-live-movement-widget'

export interface LiveMovementWidgetProps extends WidgetPassthrough {
  id: IdType
  title?: string
}

/**
 * Widget to display a live movement.
 */
export const LiveMovementWidget = ({
  id,
  title,
  ...passThrough
}: LiveMovementWidgetProps) => {
  const liveMovementState = useApiStateEntry('liveMovements', id)

  if (!liveMovementState) {
    return null
  }

  return (
    <StatelessLiveMovementWidget
      id={id}
      state={liveMovementState}
      title={title ?? liveMovementState.name ?? `Movement ${id}`}
      {...passThrough}
    />
  )
}
