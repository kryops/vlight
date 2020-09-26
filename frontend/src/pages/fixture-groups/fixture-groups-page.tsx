import React from 'react'

import { useMasterData } from '../../hooks/api'
import { FixtureGroupWidget } from '../../widgets/fixture-group/fixture-group-widget'
import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { Button } from '../../ui/buttons/button'
import { iconOn } from '../../ui/icons'
import { setFixtureGroupState } from '../../api'

const FixtureGroupsPage = memoInProduction(() => {
  const { fixtureGroups } = useMasterData()

  function setOnForAllGroups(on: boolean) {
    setFixtureGroupState(
      fixtureGroups.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Header
        rightContent={
          <>
            <Button icon={iconOn} onDown={() => setOnForAllGroups(true)}>
              ON
            </Button>
            <Button icon={iconOn} onDown={() => setOnForAllGroups(false)}>
              OFF
            </Button>
          </>
        }
      >
        Groups
      </Header>
      <div className={pageWithWidgets}>
        {fixtureGroups.map(group => (
          <FixtureGroupWidget key={group.id} group={group} />
        ))}
      </div>
    </>
  )
})

export default FixtureGroupsPage
