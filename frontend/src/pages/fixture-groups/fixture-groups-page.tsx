import React from 'react'

import { useMasterData } from '../../hooks/api'
import { FixtureGroupWidget } from '../../widgets/fixture-group/fixture-group-widget'
import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'

const FixtureGroupsPage = memoInProduction(() => {
  const { fixtureGroups } = useMasterData()

  return (
    <div className={pageWithWidgets}>
      {fixtureGroups.map(group => (
        <FixtureGroupWidget key={group.id} group={group} />
      ))}
    </div>
  )
})

export default FixtureGroupsPage
