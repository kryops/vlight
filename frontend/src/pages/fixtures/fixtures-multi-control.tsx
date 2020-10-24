import { mapFixtureList, getCommonFixtureState } from '@vlight/controls'
import { useState } from 'react'

import { setFixtureState } from '../../api'
import { useApiState, useMasterData, useMasterDataMaps } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'

export function FixturesMultiControl() {
  const [fixtures, setFixtures] = useState<string[]>([])

  const masterData = useMasterData()
  const masterDataMaps = useMasterDataMaps()
  const mapping = useCommonFixtureMapping(fixtures)
  const fixtureStates = useApiState('fixtures')

  const allFixtures = mapFixtureList(fixtures, { masterData, masterDataMaps })

  const commonFixtureState = getCommonFixtureState(
    allFixtures.map(fixture => fixtureStates[fixture]).filter(Boolean)
  )

  return (
    <Collapsible title="Multi Control">
      <TwoColumDialogContainer
        left={
          <FixtureListInput
            value={fixtures}
            onChange={setFixtures}
            hideGroupMode
          />
        }
        right={
          allFixtures.length > 0 && (
            <FixtureStateWidget
              title={`${allFixtures.length} Fixtures`}
              mapping={mapping}
              fixtureState={commonFixtureState}
              onChange={newState => {
                // TODO respect each fixture's mapping (do not set colors for monochrome fixture)
                const stateToApply = { ...newState }
                if (commonFixtureState.on) stateToApply.on = true
                setFixtureState(allFixtures, stateToApply, true)
              }}
            />
          )
        }
        fullWidth
      />
    </Collapsible>
  )
}
