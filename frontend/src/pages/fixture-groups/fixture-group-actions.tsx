import { Link } from 'react-router-dom'

import { setFixtureGroupState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconAdd, iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { openEntityEditor } from '../config/entities/editors'

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
        disabled={isAllOn(fixtureGroupsState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllFixtureGroups(false)}
        disabled={!isAnyOn(fixtureGroupsState)}
      >
        OFF
      </Button>
    </>
  )
}
