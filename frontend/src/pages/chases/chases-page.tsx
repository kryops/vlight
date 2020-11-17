import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'

import { LiveChases } from './live-chases'

const ChasesPage = memoInProduction(() => {
  return (
    <>
      <Header>Chases</Header>
      <LiveChases />
    </>
  )
})

export default ChasesPage
