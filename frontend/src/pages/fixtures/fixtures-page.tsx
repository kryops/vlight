import { pageWithWidgets } from '../../ui/css/page'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { useMasterData } from '../../hooks/api'
import { useNumberHotkey } from '../../hooks/hotkey'

import { FixturesActions } from './fixtures-actions'
import { FixturesMultiControl } from './fixtures-multi-control'

/**
 * Fixtures page.
 *
 * Displays
 * - a multi-control widget
 * - widgets for all configured fixtures
 */
const FixturesPage = memoInProduction(() => {
  const { fixtures } = useMasterData()

  const activeHotkeyIndex = useNumberHotkey(fixtures.length)

  return (
    <>
      <Header rightContent={<FixturesActions />}>Fixtures</Header>
      <FixturesMultiControl />
      <div className={pageWithWidgets}>
        {fixtures.map((fixture, index) => (
          <FixtureWidget
            key={fixture.id}
            fixture={fixture}
            hotkeysActive={index === activeHotkeyIndex}
          />
        ))}
      </div>
    </>
  )
})

export default FixturesPage
