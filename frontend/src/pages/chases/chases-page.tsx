import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { useApiStateSelector } from '../../hooks/api'
import { useNumberHotkey } from '../../hooks/hotkey'

import { LiveChases } from './live-chases'
import { ChasesActions } from './chases-actions'

/**
 * Channels page.
 *
 * Displays widgets for all live chases.
 */
const ChasesPage = memoInProduction(() => {
  const liveChasesCount = useApiStateSelector(
    apiState => Object.keys(apiState.liveChases).length,
    { event: 'liveChases' }
  )
  const activeHotkeyIndex = useNumberHotkey(liveChasesCount)

  return (
    <>
      <Header rightContent={<ChasesActions />}>Chases</Header>
      <LiveChases startHotkeyIndex={0} activeHotkeyIndex={activeHotkeyIndex} />
    </>
  )
})

export default ChasesPage
