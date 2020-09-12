import React from 'react'

import { useApiState } from '../../hooks/api'

import { StatelessChannelsWidget } from './stateless-channels-widget'

export interface ChannelsWidgetProps {
  from: number
  to: number
  title?: string
}

export const ChannelsWidget = ({ from, to, title }: ChannelsWidgetProps) => {
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
