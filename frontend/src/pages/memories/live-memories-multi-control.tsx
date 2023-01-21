import { IdType } from '@vlight/types'
import { average } from '@vlight/utils'
import { useCallback, useState } from 'react'

import { setLiveMemoryState } from '../../api'
import { useApiState } from '../../hooks/api'
import { useEvent, useShallowEqualMemo } from '../../hooks/performance'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'
import { iconLiveMemory } from '../../ui/icons'
import { memoInProduction } from '../../util/development'

function LiveMemoriesMultiControlInner() {
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([])

  const memoryStates = useApiState('liveMemories')

  const on = selectedMemoryIds.some(id => memoryStates[id]?.on)
  const commonValue = average(
    selectedMemoryIds.map(id => memoryStates[id]?.value ?? 0)
  )

  const changeValue = useEvent((value: number) =>
    selectedMemoryIds.forEach(id =>
      setLiveMemoryState(
        id,
        {
          value,
        },
        true
      )
    )
  )

  const liveMemoryIds = useShallowEqualMemo(Object.keys(memoryStates))

  const getDisplayValue = useCallback(
    (id: IdType) => memoryStates[id].name ?? `Live Memory ${id}`,
    [memoryStates]
  )

  const toggleOn = useEvent(() =>
    selectedMemoryIds.forEach(id =>
      setLiveMemoryState(
        id,
        {
          on: !on,
        },
        true
      )
    )
  )

  return (
    <TwoColumDialogContainer
      left={
        <MultiToggleInput
          value={selectedMemoryIds}
          entries={liveMemoryIds}
          onChange={setSelectedMemoryIds}
          getDisplayValue={getDisplayValue}
        />
      }
      right={
        selectedMemoryIds.length > 0 && (
          <Widget
            icon={iconLiveMemory}
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
 * Collapsible widget to control multiple live memories together.
 */
export const LiveMemoriesMultiControl = memoInProduction(() => {
  const memoryStates = useApiState('liveMemories')
  if (Object.keys(memoryStates).length < 2) return null

  return (
    <Collapsible title="Multi Control">
      <LiveMemoriesMultiControlInner />
    </Collapsible>
  )
})
