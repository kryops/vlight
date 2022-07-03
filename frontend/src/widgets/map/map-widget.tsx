import { useDmxUniverse, useMasterData } from '../../hooks/api'

import { StatelessMapWidget } from './stateless-map-widget'

export interface MapWidgetProps {
  standalone?: boolean
  className?: string
}

/**
 * Widget to display a map of all fixtures with the current DMX universe state.
 *
 * NOTE: Re-renders up to 20 times a second.
 */
export const MapWidget = ({ standalone, className }: MapWidgetProps) => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()

  return (
    <StatelessMapWidget
      universe={universe}
      fixtures={masterData.fixtures}
      standalone={standalone}
      className={className}
    />
  )
}
