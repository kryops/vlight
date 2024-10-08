import { apiState } from '../../api/api-state'
import { getUniverseIndex } from '../../api/util'
import { useApiStateSelector, useMasterData } from '../../hooks/api'
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
    // only re-render if the displayed channels actually change
    useApiStateSelector<number[] | undefined>(
      currentApiState =>
        currentApiState.universe?.slice(
          getUniverseIndex(from),
          getUniverseIndex(to) + 1
        ),
      { includeUniverse: true, event: 'universe' }
    )

    const masterData = useMasterData()

    return (
      <StatelessUniverseWidget
        universe={apiState.universe!}
        masterData={masterData}
        from={from}
        to={to}
        title={title}
      />
    )
  }
)
