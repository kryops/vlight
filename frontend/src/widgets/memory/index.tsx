import { Memory } from '@vlight/entities'
import React from 'react'

import { useAppState } from '../../hooks/api'

import { StatelessMemoryWidget } from './widget'

export interface Props {
  memory: Memory
}

export const MemoryWidget: React.SFC<Props> = ({ memory }) => {
  const appState = useAppState()
  const memoryState = appState.memories[memory.id]

  if (!memoryState) {
    return null
  }

  return <StatelessMemoryWidget memory={memory} state={memoryState} />
}
