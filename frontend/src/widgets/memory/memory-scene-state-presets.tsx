import { MemorySceneState, MemorySceneStatePreset } from '@vlight/types'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import {
  editEntityWithCustomLogic,
  removeEntityWithCustomLogic,
} from '../../pages/config/entities/entity-ui-mapping'
import { getMemorySceneStatePreviewBackground } from '../../util/memories'
import { PresetsEditor } from '../../ui/controls/presets-editor'

const getName = (preset: MemorySceneStatePreset) => preset.name
const getBackgrounds = (preset: MemorySceneStatePreset) => [
  getMemorySceneStatePreviewBackground(preset.state),
]
const onRename = (preset: MemorySceneStatePreset, newName: string): void =>
  editEntityWithCustomLogic('memorySceneStatePresets', {
    ...preset,
    name: newName,
  })
const onDelete = (preset: MemorySceneStatePreset): void =>
  removeEntityWithCustomLogic('memorySceneStatePresets', preset)

export interface MemorySceneStatePresetsProps {
  /**
   * The current state to save in the preset
   */
  getCurrentState: () => MemorySceneState

  onChange: (newValue: MemorySceneState) => void
}

/**
 * Displays the memory scene state presets and allows editing and deleting them.
 */
export const MemorySceneStatePresets = memoInProduction(
  ({ getCurrentState, onChange }: MemorySceneStatePresetsProps) => {
    const masterData = useMasterData()

    return (
      <PresetsEditor
        presets={masterData.memorySceneStatePresets}
        getName={getName}
        getBackgrounds={getBackgrounds}
        onApply={preset => onChange(preset.state)}
        onSave={name =>
          editEntityWithCustomLogic('memorySceneStatePresets', {
            id: '',
            name,
            state: getCurrentState(),
          })
        }
        onRename={onRename}
        onDelete={onDelete}
      />
    )
  }
)
