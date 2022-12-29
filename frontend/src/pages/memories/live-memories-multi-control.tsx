import { average } from '@vlight/utils'
import { useState } from 'react'

import { setLiveMemoryState } from '../../api'
import { useApiState } from '../../hooks/api'
import { Collapsible } from '../../ui/containers/collapsible'
import { TwoColumDialogContainer } from '../../ui/containers/two-column-dialog'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { MultiToggleInput } from '../../ui/forms/multi-toggle-input'
import { iconLiveMemory } from '../../ui/icons'

/**
 * Collapsible widget to control multiple live memories together.
 */
export function LiveMemoriesMultiControl() {
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([])

  const memoryStates = useApiState('liveMemories')

  if (Object.keys(memoryStates).length < 2) return null

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
            entries={Object.keys(memoryStates)}
            onChange={setSelectedMemoryIds}
            getDisplayValue={id => `Live Memory ${id}`}
          />
        }
        right={
          selectedMemoryIds.length > 0 && (
            <Widget
              icon={iconLiveMemory}
              title={`${selectedMemoryIds.length} Memories`}
              onTitleClick={() =>
                selectedMemoryIds.forEach(id =>
                  setLiveMemoryState(
                    id,
                    {
                      on: !on,
                    },
                    true
                  )
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
                    selectedMemoryIds.forEach(id =>
                      setLiveMemoryState(
                        id,
                        {
                          value,
                        },
                        true
                      )
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
