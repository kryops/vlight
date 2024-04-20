import { ChaseColor, ChaseColorPreset } from '@vlight/types'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import {
  editEntityWithCustomLogic,
  removeEntityWithCustomLogic,
} from '../../pages/config/entities/entity-ui-mapping'
import { PresetsEditor } from '../../ui/controls/presets-editor'

import { getChasePreviewColor } from './utils'

const getName = (preset: ChaseColorPreset): string => preset.name
const getBackgrounds = (preset: ChaseColorPreset): string[] =>
  preset.colors.map(getChasePreviewColor)
const onRename = (preset: ChaseColorPreset, newName: string): void =>
  editEntityWithCustomLogic('chaseColorPresets', {
    ...preset,
    name: newName,
  })
const onDelete = (preset: ChaseColorPreset): void =>
  removeEntityWithCustomLogic('chaseColorPresets', preset)

export interface ChaseColorPresetsProps {
  /**
   * The current colors to save in the preset
   */
  getCurrentColors: () => ChaseColor[]

  onChange: (newValue: ChaseColor[]) => void
}

/**
 * Displays the chase color presets and allows editing and deleting them.
 */
export const ChaseColorPresets = memoInProduction(
  ({ getCurrentColors, onChange }: ChaseColorPresetsProps) => {
    const masterData = useMasterData()

    return (
      <PresetsEditor
        presets={masterData.chaseColorPresets}
        getName={getName}
        getBackgrounds={getBackgrounds}
        onApply={preset => onChange(preset.colors)}
        onSave={name =>
          editEntityWithCustomLogic('chaseColorPresets', {
            id: '',
            name,
            colors: getCurrentColors(),
          })
        }
        onRename={onRename}
        onDelete={onDelete}
      />
    )
  }
)
