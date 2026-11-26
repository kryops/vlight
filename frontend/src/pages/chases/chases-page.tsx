import { Header } from '../../ui/containers/header'
import { useApiStateSelector } from '../../hooks/api'
import { useNumberHotkey } from '../../hooks/hotkey'
import { useSearch } from '../../hooks/search'
import { SearchToggle } from '../../ui/components/search-toggle'
import { getLiveChaseTitle, getLiveMovementTitle } from '../../util/entities'

import { LiveChases } from './live-chases'
import { LiveMovements } from './live-movements'
import { ChasesActions } from './chases-actions'

/**
 * Chases page.
 *
 * Displays widgets for all live chases and live movements.
 */
const ChasesPage = () => {
  const search = useSearch()

  const liveChasesCount = useApiStateSelector(
    apiState =>
      Object.entries(apiState.liveChases).filter(([id, liveChase]) =>
        search.matches(getLiveChaseTitle(id, liveChase))
      ).length,
    { event: 'liveChases' }
  )
  const liveMovementsCount = useApiStateSelector(
    apiState =>
      Object.entries(apiState.liveMovements).filter(([id, liveMovement]) =>
        search.matches(getLiveMovementTitle(id, liveMovement))
      ).length,
    { event: 'liveMovements' }
  )
  const activeHotkeyIndex = useNumberHotkey(
    liveChasesCount + liveMovementsCount,
    search.query
  )

  return (
    <>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <ChasesActions />
          </>
        }
      >
        Chases
      </Header>
      <LiveChases
        search={search}
        startHotkeyIndex={0}
        activeHotkeyIndex={activeHotkeyIndex}
      />
      <LiveMovements
        search={search}
        startHotkeyIndex={liveChasesCount}
        activeHotkeyIndex={activeHotkeyIndex}
      />
    </>
  )
}

export default ChasesPage
