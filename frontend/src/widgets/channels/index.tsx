import React from 'react'

import { useAppState } from '../../hooks/api'

import { StatelessChannelsWidget } from './widget'

export interface Props {
  from: number
  to: number
  title?: string
}

export const ChannelsWidget: React.SFC<Props> = ({ from, to, title }) => {
  const appState = useAppState()
  const channels = appState.channels

  return (
    <StatelessChannelsWidget
      channels={channels}
      from={from}
      to={to}
      title={title}
    />
  )
}
