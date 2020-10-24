import { pageWithWidgets } from '../../ui/css/page'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { useMasterData } from '../../hooks/api'

import { FixturesActions } from './fixtures-actions'

const FixturesPage = memoInProduction(() => {
  const { fixtures } = useMasterData()

  return (
    <>
      <Header rightContent={<FixturesActions />}>Fixtures</Header>
      <div className={pageWithWidgets}>
        {fixtures.map(fixture => (
          <FixtureWidget key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </>
  )
})

export default FixturesPage
