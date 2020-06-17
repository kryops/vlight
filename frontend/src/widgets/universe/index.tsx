import React from 'react'

import { useDmxUniverse, useMasterData } from '../../hooks/api'

import { StatelessUniverseWidget } from './widget'

export interface UniverseWidgetProps {
  from: number
  to: number
  title?: string
}

export const UniverseWidget = ({ from, to, title }: UniverseWidgetProps) => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()

  return (
    <StatelessUniverseWidget
      universe={universe}
      masterData={masterData}
      from={from}
      to={to}
      title={title}
    />
  )
}
