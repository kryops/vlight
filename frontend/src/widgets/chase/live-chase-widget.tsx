import { IdType } from '@vlight/types'

import { useApiStateEntry } from '../../hooks/api'

import { StatelessLiveChaseWidget } from './stateless-live-chase-widget'

export interface LiveChaseWidgetProps {
  id: IdType
  title?: string
}

export const LiveChaseWidget = ({ id, title }: LiveChaseWidgetProps) => {
  const liveChaseState = useApiStateEntry('liveChases', id)

  if (!liveChaseState) {
    return null
  }

  return (
    <StatelessLiveChaseWidget id={id} state={liveChaseState} title={title} />
  )
}
