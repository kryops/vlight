import React from 'react'

import { useDmxUniverse, useMasterData } from '../../hooks/api'

import { StatelessMapWidget } from './stateless-map-widget'

export interface MapWidgetProps {
  standalone?: boolean
}

export const MapWidget = ({ standalone }: MapWidgetProps) => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()

  return (
    <StatelessMapWidget
      universe={universe}
      fixtures={masterData.fixtures}
      standalone={standalone}
    />
  )
}
