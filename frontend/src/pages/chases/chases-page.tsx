import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'

import { LiveChases } from './live-chases'
import { ChasesActions } from './chases-actions'

/**
 * Channels page.
 *
 * Displays widgets for all live chases.
 */
const ChasesPage = memoInProduction(() => {
  return (
    <>
      <Header rightContent={<ChasesActions />}>Chases</Header>
      <LiveChases />
    </>
  )
})

export default ChasesPage
