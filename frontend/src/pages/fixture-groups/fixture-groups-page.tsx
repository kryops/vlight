import { useMasterData } from '../../hooks/api'
import { FixtureGroupWidget } from '../../widgets/fixture-group/fixture-group-widget'
import { pageWithWidgets } from '../../ui/css/page'
import { Header } from '../../ui/containers/header'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { useSearch } from '../../hooks/search'
import { SearchToggle } from '../../ui/components/search-toggle'
import { NoSearchResults } from '../../ui/components/no-search-results'

import { FixtureGroupsActions } from './fixture-group-actions'
import { FixtureGroupMultiControl } from './fixture-group-multi-control'

/**
 * Fixture groups page.
 *
 * Displays
 * - a multi-control widget
 * - widgets for all configured fixture groups
 */
const FixtureGroupsPage = () => {
  const { fixtureGroups } = useMasterData()
  const search = useSearch()

  const filteredGroups = search.active
    ? fixtureGroups.filter(group => search.matches(group.name ?? group.id))
    : fixtureGroups

  const activeHotkeyIndex = useNumberHotkey(filteredGroups.length, search.query)

  return (
    <>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <FixtureGroupsActions />
          </>
        }
      >
        Groups
      </Header>
      <FixtureGroupMultiControl />
      <div className={pageWithWidgets}>
        {filteredGroups.map((group, index) => (
          <FixtureGroupWidget
            key={group.id}
            group={group}
            cornerLabel={getHotkeyLabel(index)}
            hotkeysActive={activeHotkeyIndex === index}
          />
        ))}
      </div>
      {search.active && filteredGroups.length === 0 && <NoSearchResults />}
    </>
  )
}

export default FixtureGroupsPage
