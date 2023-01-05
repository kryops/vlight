import {
  getCommonFixtureState,
  mergeFixtureStates,
  getCommonFixtureMapping,
} from '@vlight/controls'
import { FixtureState, IdType } from '@vlight/types'
import { isTruthy, isUnique } from '@vlight/utils'
import { useCallback, useState } from 'react'

import { setFixtureGroupState } from '../../api'
import {
  useApiState,
  useMasterData,
  useMasterDataAndMaps,
} from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import {
  useDeepEqualMemo,
  useEvent,
  useShallowEqualMemo,
} from '../../hooks/performance'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'
import { iconGroup } from '../../ui/icons'
import { memoInProduction } from '../../util/development'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'

function FixtureGroupMultiControlInner() {
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

  const commonState = useDeepEqualMemo(
    getCommonFixtureState(
      selectedGroups.map(group => ({
        state: fixtureGroupStates[group.id],
        mapping: getCommonFixtureMapping(group.fixtures, masterDataAndMaps),
      }))
    )
  )

  const fixtureGroupIds = useShallowEqualMemo(
    masterData.fixtureGroups.map(it => it.id)
  )
  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.fixtureGroups.get(id)?.name ?? id,
    [masterDataMaps]
  )

  const changeFixtureGroupState = useEvent(
    (newState: Partial<FixtureState>) => {
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
    }
  )

  return (
    <TwoColumDialogContainer
      left={
        <MultiToggleInput
          value={selectedGroupIds}
          entries={fixtureGroupIds}
          onChange={setSelectedGroupIds}
          getDisplayValue={getDisplayValue}
        />
      }
      right={
        selectedGroupIds.length > 0 && (
          <FixtureStateWidget
            icon={iconGroup}
            title={`${selectedGroupIds.length} Groups`}
            mapping={mapping}
            fixtureState={commonState}
            onChange={changeFixtureGroupState}
          />
        )
      }
      fullWidth
      preferSingleRow
    />
  )
}

/**
 * Collapsible widget to control multiple fixture groups together.
 */
export const FixtureGroupMultiControl = memoInProduction(() => {
  const masterData = useMasterData()
  if (masterData.fixtureGroups.length < 2) return null

  return (
    <Collapsible title="Multi Control">
      <FixtureGroupMultiControlInner />
    </Collapsible>
  )
})
