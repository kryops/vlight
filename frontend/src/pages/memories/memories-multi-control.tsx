import { average } from '@vlight/utils'
import { useState } from 'react'

import { setMemoryState } from '../../api'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'

export function MemoriesMultiControl() {
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([])

  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterData, masterDataMaps } = masterDataAndMaps

  const memoryStates = useApiState('memories')

  if (masterData.memories.length < 2) return null

  const on = selectedMemoryIds.some(id => memoryStates[id]?.on)
  const commonValue = average(
    selectedMemoryIds.map(id => memoryStates[id]?.value ?? 0)
  )

  return (
    <Collapsible title="Multi Control">
      <TwoColumDialogContainer
        left={
          <MultiToggleInput
            value={selectedMemoryIds}
            entries={masterData.memories.map(it => it.id)}
            onChange={setSelectedMemoryIds}
            getDisplayValue={id => masterDataMaps.memories.get(id)?.name ?? id}
          />
        }
        right={
          selectedMemoryIds.length > 0 && (
            <Widget
              title={`${selectedMemoryIds.length} Memories`}
              onTitleClick={() =>
                setMemoryState(
                  selectedMemoryIds,
                  {
                    on: !on,
                  },
                  true
                )
              }
              turnedOn={on}
            >
              <div className={faderContainer}>
                <Fader
                  max={255}
                  step={1}
                  value={commonValue}
                  onChange={value =>
                    setMemoryState(
                      selectedMemoryIds,
                      {
                        value,
                      },
                      true
                    )
                  }
                />
              </div>
            </Widget>
          )
        }
        fullWidth
      />
    </Collapsible>
  )
}
