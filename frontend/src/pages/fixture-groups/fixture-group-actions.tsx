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
import { ApiState } from '../../api/worker/processing'

function setOnForAllFixtureGroups(on: boolean) {
  setFixtureGroupState(
    apiState.masterData!.fixtureGroups.map(it => it.id),
    { on },
    true
  )
}

export function isAnyFixtureGroupOn(apiState: ApiState) {
  return isAnyOn(apiState.fixtureGroups)
}

export const turnAllFixtureGroupsOn = () => setOnForAllFixtureGroups(true)
export const turnAllFixtureGroupsOff = () => setOnForAllFixtureGroups(false)

const addFixtureGroup = () => openEntityEditor('fixtureGroups')

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
      allOff: !isAnyFixtureGroupOn(apiState),
    }),
    { event: 'fixtureGroups' }
  )

  return (
    <HotkeyContext.Provider value={true}>
      <Button icon={iconAdd} transparent onClick={addFixtureGroup} />
      <Link to={entitiesPageRoute('fixtureGroups')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onClick={turnAllFixtureGroupsOn}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllFixtureGroupsOff}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
})
