import { IdType } from '@vlight/types'
import { average } from '@vlight/utils'
import { useCallback, useState } from 'react'

import { setMemoryState } from '../../api'
import {
  useApiState,
  useMasterData,
  useMasterDataAndMaps,
} from '../../hooks/api'
import { useEvent, useShallowEqualMemo } from '../../hooks/performance'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'
import { iconMemory } from '../../ui/icons'
import { memoInProduction } from '../../util/development'

function MemoriesMultiControlInner() {
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([])

  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterData, masterDataMaps } = masterDataAndMaps

  const memoryStates = useApiState('memories')

  const on = selectedMemoryIds.some(id => memoryStates[id]?.on)
  const commonValue = average(
    selectedMemoryIds.map(id => memoryStates[id]?.value ?? 0)
  )

  const changeValue = useEvent((value: number) =>
    setMemoryState(
      selectedMemoryIds,
      {
        value,
      },
      true
    )
  )

  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.memories.get(id)?.name ?? id,
    [masterDataMaps.memories]
  )

  const memoryIds = useShallowEqualMemo(masterData.memories.map(it => it.id))

  const toggleOn = useEvent(() =>
    setMemoryState(
      selectedMemoryIds,
      {
        on: !on,
      },
      true
    )
  )

  return (
    <TwoColumDialogContainer
      left={
        <MultiToggleInput
          value={selectedMemoryIds}
          entries={memoryIds}
          onChange={setSelectedMemoryIds}
          getDisplayValue={getDisplayValue}
        />
      }
      right={
        selectedMemoryIds.length > 0 && (
          <Widget
            icon={iconMemory}
            title={`${selectedMemoryIds.length} Memories`}
            onTitleClick={toggleOn}
            turnedOn={on}
          >
            <div className={faderContainer}>
              <Fader
                max={255}
                step={1}
                value={commonValue}
                onChange={changeValue}
              />
            </div>
          </Widget>
        )
      }
      fullWidth
    />
  )
}

/**
 * Collapsible widget to control multiple memories together.
 */
export const MemoriesMultiControl = memoInProduction(() => {
  const masterData = useMasterData()
  if (masterData.memories.length < 2) return null

  return (
    <Collapsible title="Multi Control">
      <MemoriesMultiControlInner />
    </Collapsible>
  )
})
