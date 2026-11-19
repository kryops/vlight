import { Header } from '../../ui/containers/header'
import { useApiStateSelector } from '../../hooks/api'
import { useNumberHotkey } from '../../hooks/hotkey'

import { LiveChases } from './live-chases'
import { LiveMovements } from './live-movements'
import { ChasesActions } from './chases-actions'

/**
 * Channels page.
 *
 * Displays widgets for all live chases and live movements.
 */
const ChasesPage = () => {
  const liveChasesCount = useApiStateSelector(
    apiState => Object.keys(apiState.liveChases).length,
    { event: 'liveChases' }
  )
  const liveMovementsCount = useApiStateSelector(
    apiState => Object.keys(apiState.liveMovements).length,
    { event: 'liveMovements' }
  )
  const activeHotkeyIndex = useNumberHotkey(
    liveChasesCount + liveMovementsCount
  )

  return (
    <>
      <Header rightContent={<ChasesActions />}>Chases</Header>
      <LiveChases startHotkeyIndex={0} activeHotkeyIndex={activeHotkeyIndex} />
      <LiveMovements
        startHotkeyIndex={liveChasesCount}
        activeHotkeyIndex={activeHotkeyIndex}
      />
    </>
  )
}

export default ChasesPage
