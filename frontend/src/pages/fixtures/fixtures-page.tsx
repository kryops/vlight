import React from 'react'

import { useMasterData } from '../../hooks/api'
import { pageWithWidgets } from '../../ui/css/page'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'
import { memoInProduction } from '../../util/development'

const FixturesPage = memoInProduction(() => {
  const { fixtures } = useMasterData()

  return (
    <div className={pageWithWidgets}>
      {fixtures.map(fixture => (
        <FixtureWidget key={fixture.id} fixture={fixture} />
      ))}
    </div>
  )
})

export default FixturesPage
