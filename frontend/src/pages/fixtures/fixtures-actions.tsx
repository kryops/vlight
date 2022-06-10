import { Link } from 'react-router-dom'

import { setFixtureState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'

export function FixturesActions() {
  const { fixtures } = useMasterData()
  const fixturesState = useApiState('fixtures')

  function setOnForAllFixtures(on: boolean) {
    setFixtureState(
      fixtures.map(it => it.id),
      { on },
      true
    )
  }

  return (
    <>
      <Link to={entitiesPageRoute('fixtures')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onDown={() => setOnForAllFixtures(true)}
        disabled={isAllOn(fixturesState)}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setOnForAllFixtures(false)}
        disabled={!isAnyOn(fixturesState)}
      >
        OFF
      </Button>
    </>
  )
}
