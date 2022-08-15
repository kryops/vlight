import { useDmxUniverse, useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'

import { StatelessUniverseWidget } from './stateless-universe-widget'

export interface UniverseWidgetProps {
  from: number
  to: number
  title?: string
}

/**
 * Widget to display the DMX universe.
 *
 * NOTE: Re-renders up to 20 times a second.
 */
export const UniverseWidget = memoInProduction(
  ({ from, to, title }: UniverseWidgetProps) => {
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
)
