import { Link } from 'react-router-dom'

import { setFixtureState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiState, useMasterData } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { HotkeyContext } from '../../hooks/hotkey'

/**
 * Corner actions for the fixtures page:
 * - Configure
 * - All on
 * - All off
 */
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
    <HotkeyContext.Provider value={true}>
      <Link to={entitiesPageRoute('fixtures')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onClick={() => setOnForAllFixtures(true)}
        disabled={isAllOn(fixturesState)}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setOnForAllFixtures(false)}
        disabled={!isAnyOn(fixturesState)}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
}
