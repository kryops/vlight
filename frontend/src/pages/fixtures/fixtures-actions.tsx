import { Link } from 'react-router-dom'

import { setFixtureState } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { HotkeyContext } from '../../hooks/hotkey'
import { apiState } from '../../api/api-state'

function setOnForAllFixtures(on: boolean) {
  setFixtureState(
    apiState.masterData!.fixtures.map(it => it.id),
    { on },
    true
  )
}

const turnAllOn = () => setOnForAllFixtures(true)
const turnAllOff = () => setOnForAllFixtures(false)

/**
 * Corner actions for the fixtures page:
 * - Configure
 * - All on
 * - All off
 */
export function FixturesActions() {
  const { allOn, allOff } = useApiStateSelector(
    apiState => ({
      allOn: isAllOn(apiState.fixtures),
      allOff: !isAnyOn(apiState.fixtures),
    }),
    { event: 'fixtures' }
  )

  return (
    <HotkeyContext.Provider value={true}>
      <Link to={entitiesPageRoute('fixtures')}>
        <Button icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconLight}
        onClick={turnAllOn}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllOff}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
}
