import React from 'react'

import { useApiState } from '../../hooks/api'

import { StatelessChannelsWidget } from './widget'

export interface ChannelsWidgetProps {
  from: number
  to: number
  title?: string
}

export const ChannelsWidget: React.FunctionComponent<ChannelsWidgetProps> = ({
  from,
  to,
  title,
}) => {
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
