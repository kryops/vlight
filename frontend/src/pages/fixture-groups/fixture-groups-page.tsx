import { useMasterData } from '../../hooks/api'
import { FixtureGroupWidget } from '../../widgets/fixture-group/fixture-group-widget'
import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'

import { FixtureGroupsActions } from './fixture-group-actions'

const FixtureGroupsPage = memoInProduction(() => {
  const { fixtureGroups } = useMasterData()

  return (
    <>
      <Header rightContent={<FixtureGroupsActions />}>Groups</Header>
      <div className={pageWithWidgets}>
        {fixtureGroups.map(group => (
          <FixtureGroupWidget key={group.id} group={group} />
        ))}
      </div>
    </>
  )
})

export default FixtureGroupsPage
