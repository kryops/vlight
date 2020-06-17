import { Memory } from '@vlight/entities'
import React from 'react'

import { useApiStateEntry } from '../../hooks/api'

import { StatelessMemoryWidget } from './widget'

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
