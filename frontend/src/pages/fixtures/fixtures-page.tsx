import React from 'react'

import { useMasterData } from '../../hooks/api'
import { pageWithWidgets } from '../../ui/css/page'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { setFixtureState } from '../../api'

const FixturesPage = memoInProduction(() => {
  const { fixtures } = useMasterData()

  function setOnForAllFixtures(on: boolean) {
    setFixtureState(
      fixtures.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Header
        rightContent={
          <>
            <Button icon={iconLight} onDown={() => setOnForAllFixtures(true)}>
              ON
            </Button>
            <Button
              icon={iconLightOff}
              onDown={() => setOnForAllFixtures(false)}
            >
              OFF
            </Button>
          </>
        }
      >
        Fixtures
      </Header>
      <div className={pageWithWidgets}>
        {fixtures.map(fixture => (
          <FixtureWidget key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </>
  )
})

export default FixturesPage
