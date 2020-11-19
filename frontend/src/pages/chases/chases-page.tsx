import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'

import { LiveChases } from './live-chases'
import { ChasesActions } from './chases-actions'

const ChasesPage = memoInProduction(() => {
  return (
    <>
      <Header rightContent={<ChasesActions />}>Chases</Header>
      <LiveChases />
    </>
  )
})

export default ChasesPage
