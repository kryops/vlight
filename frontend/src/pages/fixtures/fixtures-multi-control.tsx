import {
  mapFixtureList,
  getCommonFixtureState,
  mergeFixtureStates,
  getCommonFixtureMapping,
} from '@vlight/controls'
import { isTruthy } from '@vlight/utils'
import { useState } from 'react'

import { setFixtureState } from '../../api'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'

/**
 * Collapsible widget to control multiple fixtures together.
 *
 * Allows selection by definition, type, and group.
 */
export function FixturesMultiControl() {
  const [fixtureStrings, setFixtureStrings] = useState<string[]>([])

  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterData, masterDataMaps } = masterDataAndMaps
  const mapping = getCommonFixtureMapping(fixtureStrings, masterDataAndMaps)
  const fixtureStates = useApiState('fixtures')

  if (masterData.fixtures.length < 2) return null

  const allFixtureIds = mapFixtureList(fixtureStrings, masterDataAndMaps)
  const allFixtures = allFixtureIds
    .map(id => masterDataMaps.fixtures.get(id))
    .filter(isTruthy)

  const commonFixtureState = getCommonFixtureState(
    allFixtures.map(fixture => ({
      state: fixtureStates[fixture.id],
      mapping: masterDataMaps.fixtureTypes.get(fixture.type)?.mapping ?? [],
    }))
  )

  return (
    <Collapsible title="Multi Control">
      <TwoColumDialogContainer
        left={
          <FixtureListInput
            value={fixtureStrings}
            onChange={setFixtureStrings}
          />
        }
        right={
          allFixtureIds.length > 0 && (
            <FixtureStateWidget
              title={`${allFixtureIds.length} Fixtures`}
              mapping={mapping}
              fixtureState={commonFixtureState}
              onChange={newState => {
                const stateToApply = { ...newState }
                if (stateToApply.on === undefined && commonFixtureState.on)
                  stateToApply.on = true

                // We group fixtures by type to reduce the mapping accordingly
                const allTypeIds = new Set(
                  allFixtures.map(fixture => fixture.type)
                )

                for (const typeId of allTypeIds) {
                  const fixtureIds = allFixtures
                    .filter(fixture => fixture.type === typeId)
                    .map(fixture => fixture.id)
                  const stateForFixtures = mergeFixtureStates(
                    undefined,
                    stateToApply,
                    masterDataMaps.fixtureTypes.get(typeId)?.mapping
                  )
                  setFixtureState(fixtureIds, stateForFixtures, true)
                }
              }}
            />
          )
        }
        fullWidth
        preferSingleRow
      />
    </Collapsible>
  )
}
