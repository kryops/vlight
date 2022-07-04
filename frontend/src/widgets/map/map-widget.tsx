import { useDmxUniverse, useMasterData } from '../../hooks/api'

import {
  StatelessMapWidget,
  StatelessMapWidgetProps,
} from './stateless-map-widget'

type MapWidgetProps = Omit<StatelessMapWidgetProps, 'fixtures' | 'universe'>

/**
 * Widget to display a map of all fixtures with the current DMX universe state.
 *
 * NOTE: Re-renders up to 20 times a second.
 */
export const MapWidget = (props: MapWidgetProps) => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()

  return (
    <StatelessMapWidget
      universe={universe}
      fixtures={masterData.fixtures}
      {...props}
    />
  )
}
