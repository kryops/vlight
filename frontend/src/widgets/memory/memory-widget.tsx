import { Memory } from '@vlight/types'
import React from 'react'

import { useApiStateEntry } from '../../hooks/api'

import { StatelessMemoryWidget } from './stateless-memory-widget'

export interface MemoryWidgetProps {
  memory: Memory
}

export const MemoryWidget = ({ memory }: MemoryWidgetProps) => {
  const memoryState = useApiStateEntry('memories', memory.id)

  if (!memoryState) {
    return null
  }

  return <StatelessMemoryWidget memory={memory} state={memoryState} />
}
