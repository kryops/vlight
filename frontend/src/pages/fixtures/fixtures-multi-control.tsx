import {
  mapFixtureList,
  getCommonFixtureState,
  mergeFixtureStates,
} from '@vlight/controls'
import { FixtureState } from '@vlight/types'
import { isTruthy } from '@vlight/utils'
import { useState } from 'react'

import { setFixtureState } from '../../api'
import {
  useApiState,
  useMasterData,
  useMasterDataAndMaps,
} from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { useDeepEqualMemo, useEvent } from '../../hooks/performance'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { iconLights } from '../../ui/icons'
import { memoInProduction } from '../../util/development'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'

/**
 * Collapsible widget to control multiple fixtures together.
 *
 * Allows selection by definition, type, and group.
 */
function FixturesMultiControlInner() {
  const [fixtureStrings, setFixtureStrings] = useState<string[]>([])

  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterDataMaps } = masterDataAndMaps
  const mapping = useCommonFixtureMapping(fixtureStrings)
  const fixtureStates = useApiState('fixtures')

  const allFixtureIds = mapFixtureList(fixtureStrings, masterDataAndMaps)
  const allFixtures = allFixtureIds
    .map(id => masterDataMaps.fixtures.get(id))
    .filter(isTruthy)

  const commonFixtureState = useDeepEqualMemo(
    getCommonFixtureState(
      allFixtures.map(fixture => ({
        state: fixtureStates[fixture.id],
        mapping: masterDataMaps.fixtureTypes.get(fixture.type)?.mapping ?? [],
      }))
    )
  )

  const changeFixtureState = useEvent((newState: Partial<FixtureState>) => {
    const stateToApply = { ...newState }
    if (stateToApply.on === undefined && commonFixtureState.on)
      stateToApply.on = true

    // We group fixtures by type to reduce the mapping accordingly
    const allTypeIds = new Set(allFixtures.map(fixture => fixture.type))

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
  })

  return (
    <TwoColumDialogContainer
      left={
        <FixtureListInput value={fixtureStrings} onChange={setFixtureStrings} />
      }
      right={
        allFixtureIds.length > 0 && (
          <FixtureStateWidget
            icon={iconLights}
            title={`${allFixtureIds.length} Fixtures`}
            mapping={mapping}
            fixtureState={commonFixtureState}
            onChange={changeFixtureState}
          />
        )
      }
      fullWidth
      preferSingleRow
    />
  )
}

/**
 * Collapsible widget to control multiple fixtures together.
 *
 * Allows selection by definition, type, and group.
 */
export const FixturesMultiControl = memoInProduction(() => {
  const masterData = useMasterData()
  if (masterData.fixtures.length < 2) return null

  return (
    <Collapsible title="Multi Control">
      <FixturesMultiControlInner />
    </Collapsible>
  )
})
