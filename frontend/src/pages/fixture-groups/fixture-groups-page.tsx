import { useMasterData } from '../../hooks/api'
import { FixtureGroupWidget } from '../../widgets/fixture-group/fixture-group-widget'
import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'

import { FixtureGroupsActions } from './fixture-group-actions'
import { FixtureGroupMultiControl } from './fixture-group-multi-control'

/**
 * Fixture groups page.
 *
 * Displays
 * - a multi-control widget
 * - widgets for all configured fixture groups
 */
const FixtureGroupsPage = memoInProduction(() => {
  const { fixtureGroups } = useMasterData()

  const activeHotkeyIndex = useNumberHotkey(fixtureGroups.length)

  return (
    <>
      <Header rightContent={<FixtureGroupsActions />}>Groups</Header>
      <FixtureGroupMultiControl />
      <div className={pageWithWidgets}>
        {fixtureGroups.map((group, index) => (
          <FixtureGroupWidget
            key={group.id}
            group={group}
            cornerLabel={getHotkeyLabel(index)}
            hotkeysActive={activeHotkeyIndex === index}
          />
        ))}
      </div>
    </>
  )
})

export default FixtureGroupsPage
