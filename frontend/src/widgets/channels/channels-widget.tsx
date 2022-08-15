import { useApiState } from '../../hooks/api'
import { memoInProduction } from '../../util/development'

import { StatelessChannelsWidget } from './stateless-channels-widget'

export interface ChannelsWidgetProps {
  from: number
  to: number
  title?: string
}

/**
 * Widget to display DMX channel faders.
 */
export const ChannelsWidget = memoInProduction(
  ({ from, to, title }: ChannelsWidgetProps) => {
    const channels = useApiState('channels')

    return (
      <StatelessChannelsWidget
        channels={channels}
        from={from}
        to={to}
        title={title}
      />
    )
  }
)
