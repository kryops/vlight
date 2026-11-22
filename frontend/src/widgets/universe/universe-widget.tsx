import { isChannelRangeEqual } from '../../api/util'
import { useApiStateSelector, useMasterData } from '../../hooks/api'

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
export const UniverseWidget = ({ from, to, title }: UniverseWidgetProps) => {
  // only re-render if the displayed channels actually change
  const universe = useApiStateSelector(
    currentApiState => currentApiState.universe,
    {
      includeUniverse: true,
      event: 'universe',
      isEqual: (a, b) => isChannelRangeEqual(a, b, from, to),
    }
  )

  const masterData = useMasterData()

  return (
    <StatelessUniverseWidget
      universe={universe!}
      masterData={masterData}
      from={from}
      to={to}
      title={title}
    />
  )
}
