import { Link } from 'react-router-dom'

import { setFixtureGroupState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconAdd, iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { openEntityEditor } from '../config/entities/editors'
import { HotkeyContext } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'
import { apiState } from '../../api/api-state'

/**
 * Corner actions for the fixture groups page:
 * - Add group
 * - Configure
 * - All on
 * - All off
 */
export const FixtureGroupsActions = memoInProduction(() => {
  const { allOn, allOff } = useApiStateSelector(
    apiState => ({
      allOn: isAllOn(apiState.fixtureGroups),
      allOff: !isAnyOn(apiState.fixtureGroups),
    }),
    { event: 'fixtureGroups' }
  )

  function setOnForAllFixtureGroups(on: boolean) {
    setFixtureGroupState(
      apiState.masterData!.fixtureGroups.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconAdd}
        transparent
        onClick={() => openEntityEditor('fixtureGroups')}
      />
      <Link to={entitiesPageRoute('fixtureGroups')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onClick={() => setOnForAllFixtureGroups(true)}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllFixtureGroups(false)}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
})
