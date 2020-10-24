import { Link } from 'react-router-dom'

import { setFixtureGroupState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'

export function FixtureGroupsActions() {
  const { fixtureGroups } = useMasterData()
  const fixtureGroupsState = useApiState('fixtureGroups')

  function setOnForAllFixtureGroups(on: boolean) {
    setFixtureGroupState(
      fixtureGroups.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Link to={entitiesPageRoute('fixtureGroups')}>
        <Button icon={iconConfig} />
      </Link>
      <Button
        icon={iconLight}
        onDown={() => setOnForAllFixtureGroups(true)}
        disabled={isAllOn(fixtureGroupsState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setOnForAllFixtureGroups(false)}
        disabled={!isAnyOn(fixtureGroupsState)}
      >
        OFF
      </Button>
    </>
  )
}
