import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'

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
export const MapWidget = memoInProduction((props: MapWidgetProps) => {
  const masterData = useMasterData()

  return (
    <StatelessMapWidget
      fixtures={masterData.fixtures}
      enableDmxUniverse
      {...props}
    />
  )
})
