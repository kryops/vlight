import {
  getCommonFixtureState,
  mergeFixtureStates,
  getCommonFixtureMapping,
} from '@vlight/controls'
import { isTruthy, isUnique } from '@vlight/utils'
import { useState } from 'react'

import { setFixtureGroupState } from '../../api'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'

export function FixtureGroupMultiControl() {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterData, masterDataMaps } = masterDataAndMaps

  const selectedGroups = selectedGroupIds
    .map(id => masterDataMaps.fixtureGroups.get(id))
    .filter(isTruthy)
  const allFixtureIds = selectedGroups
    .flatMap(group => group.fixtures)
    .filter(isUnique)
  const mapping = useCommonFixtureMapping(allFixtureIds)
  const fixtureGroupStates = useApiState('fixtureGroups')

  const commonState = getCommonFixtureState(
    selectedGroups.map(group => ({
      state: fixtureGroupStates[group.id],
      mapping: getCommonFixtureMapping(group.fixtures, masterDataAndMaps),
    }))
  )

  if (masterData.fixtureGroups.length < 2) return null

  return (
    <Collapsible title="Multi Control">
      <TwoColumDialogContainer
        left={
          <MultiToggleInput
            value={selectedGroupIds}
            entries={masterData.fixtureGroups.map(it => it.id)}
            onChange={setSelectedGroupIds}
            getDisplayValue={id =>
              masterDataMaps.fixtureGroups.get(id)?.name ?? id
            }
          />
        }
        right={
          selectedGroupIds.length > 0 && (
            <FixtureStateWidget
              title={`${selectedGroupIds.length} Groups`}
              mapping={mapping}
              fixtureState={commonState}
              onChange={newState => {
                const stateToApply = { ...newState }
                if (stateToApply.on === undefined && commonState.on)
                  stateToApply.on = true

                for (const group of selectedGroups) {
                  setFixtureGroupState(
                    group.id,
                    mergeFixtureStates(
                      undefined,
                      stateToApply,
                      getCommonFixtureMapping(group.fixtures, masterDataAndMaps)
                    ),
                    true
                  )
                }
              }}
            />
          )
        }
        fullWidth
      />
    </Collapsible>
  )
}
