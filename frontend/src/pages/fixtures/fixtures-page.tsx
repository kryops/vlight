import { pageWithWidgets } from '../../ui/css/page'
import {
  FixtureWidget,
  getFixtureName,
} from '../../widgets/fixture/fixture-widget'
import { Header } from '../../ui/containers/header'
import { useMasterData, useMasterDataMaps } from '../../hooks/api'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { useSearch } from '../../hooks/search'
import { SearchToggle } from '../../ui/components/search-toggle'
import { NoSearchResults } from '../../ui/components/no-search-results'

import { FixturesActions } from './fixtures-actions'
import { FixturesMultiControl } from './fixtures-multi-control'

/**
 * Fixtures page.
 *
 * Displays
 * - a multi-control widget
 * - widgets for all configured fixtures
 */
const FixturesPage = () => {
  const { fixtures } = useMasterData()
  const { fixtureTypes } = useMasterDataMaps()
  const search = useSearch()

  const filteredFixtures = search.active
    ? fixtures.filter(fixture => {
        const fixtureType = fixtureTypes.get(fixture.type)
        return search.matches(
          fixtureType ? getFixtureName(fixture, fixtureType) : fixture.name
        )
      })
    : fixtures

  const activeHotkeyIndex = useNumberHotkey(
    filteredFixtures.length,
    search.query
  )

  return (
    <>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <FixturesActions />
          </>
        }
      >
        Fixtures
      </Header>
      <FixturesMultiControl />
      <div className={pageWithWidgets}>
        {filteredFixtures.map((fixture, index) => (
          <FixtureWidget
            key={fixture.id}
            fixture={fixture}
            cornerLabel={getHotkeyLabel(index)}
            hotkeysActive={index === activeHotkeyIndex}
          />
        ))}
      </div>
      {search.active && filteredFixtures.length === 0 && <NoSearchResults />}
    </>
  )
}

export default FixturesPage
