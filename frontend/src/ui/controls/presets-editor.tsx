import { css } from '@linaria/core'
import { useState } from 'react'

import { useEvent } from '../../hooks/performance'
import { memoInProduction } from '../../util/development'
import { Button } from '../buttons/button'
import { Clickable } from '../components/clickable'
import { flexContainer } from '../css/flex'
import { iconDelete, iconAdd, iconConfig } from '../icons'
import { Icon } from '../icons/icon'
import { yesNo } from '../overlays/buttons'
import { showPromptDialog, showDialog } from '../overlays/dialog'
import { primaryShade, baseline } from '../styles'

const presetsContainer = css`
  display: flex;
  border: 1px solid ${primaryShade(1)};
  margin-top: ${baseline()};
`

const presetsInnerContainer = css`
  flex: 1 1 auto;
  max-height: ${baseline(32)};
  overflow-y: auto;
`

const presetContainer = css`
  border: 1px solid ${primaryShade(1)};
  display: inline-block;
  min-width: ${baseline(12)};
  margin: ${baseline()};
`

const presetColors = flexContainer

const presetColor = css`
  flex: 1 1 auto;
  height: ${baseline(8)};
`

const presetName = css`
  padding: ${baseline()};
  text-align: center;
  font-size: 80%;
`

const PresetContainer = memoInProduction(
  ({
    name,
    previewBackgrounds,
    onRename,
    onApply,
    onDelete,
    editingPresets,
  }: {
    name: string
    previewBackgrounds: string[]
    onRename: (newName: string) => void
    onApply: () => void
    onDelete: () => void
    editingPresets: boolean
  }) => {
    const onClick = useEvent(async () => {
      if (editingPresets) {
        const newName = await showPromptDialog({
          title: 'Rename Preset',
          label: 'Name',
          initialValue: name,
        })
        if (!newName) return
        onRename(newName)
      } else {
        onApply()
      }
    })

    const deletePreset = useEvent(
      async (event: { stopPropagation: () => void }) => {
        event.stopPropagation()
        const result = await showDialog(
          `Really delete preset "${name}"?`,
          yesNo
        )
        if (result) {
          return onDelete()
        }
      }
    )

    return (
      <Clickable onClick={onClick} className={presetContainer}>
        <div className={presetColors}>
          {previewBackgrounds.map((background, index) => (
            <div key={index} className={presetColor} style={{ background }} />
          ))}
        </div>
        <div className={presetName}>
          {name}
          {editingPresets && (
            <>
              <br />
              <br />
              <Icon
                size={4}
                icon={iconDelete}
                hoverable
                inline
                padding
                onClick={deletePreset}
              />
            </>
          )}
        </div>
      </Clickable>
    )
  }
)

export interface PresetsEditorProps<T> {
  presets: T[]
  getName: (preset: T) => string
  getBackgrounds: (preset: T) => string[]

  onApply: (preset: T) => void
  onSave: (newName: string) => void
  onRename: (preset: T, newName: string) => void
  onDelete: (preset: T) => void
}

/**
 * Displays the memory scene state presets and allows editing and deleting them.
 */
export const PresetsEditor = memoInProduction(
  <T extends any>({
    presets,
    getName,
    getBackgrounds,
    onApply,
    onSave,
    onRename,
    onDelete,
  }: PresetsEditorProps<T>) => {
    const [editingPresets, setEditingPresets] = useState(false)

    const saveCurrentState = useEvent(async () => {
      const name = await showPromptDialog({
        title: 'Save as Preset',
        label: 'Name',
      })
      if (name === undefined) return

      onSave(name)
    })

    const toggleEditingPresets = useEvent(async () => {
      setEditingPresets(!editingPresets)
    })

    return (
      <div className={presetsContainer}>
        <div className={presetsInnerContainer}>
          {presets.length === 0 && (
            <i style={{ lineHeight: 2.4 }}>&nbsp; No presets saved.</i>
          )}
          {presets.map((preset, index) => (
            <PresetContainer
              key={index}
              name={getName(preset)}
              previewBackgrounds={getBackgrounds(preset)}
              onApply={() => onApply(preset)}
              onDelete={() => onDelete(preset)}
              onRename={newName => onRename(preset, newName)}
              editingPresets={editingPresets}
            />
          ))}
        </div>

        <div>
          <Button
            icon={iconAdd}
            title="Save current state as preset"
            transparent
            onClick={saveCurrentState}
          />
          <br />
          {presets.length > 0 && (
            <Button
              icon={iconConfig}
              title="Rename or delete presets"
              transparent
              active={editingPresets ? true : undefined}
              onClick={toggleEditingPresets}
            />
          )}
        </div>
      </div>
    )
  }
)
