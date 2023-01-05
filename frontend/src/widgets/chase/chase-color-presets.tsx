import { css } from '@linaria/core'
import { ChaseColor } from '@vlight/types'
import { useState } from 'react'

import { Button } from '../../ui/buttons/button'
import { Clickable } from '../../ui/components/clickable'
import { iconAdd, iconConfig, iconDelete } from '../../ui/icons'
import { baseline, primaryShade } from '../../ui/styles'
import { editEntity, removeEntity } from '../../api'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { useMasterData } from '../../hooks/api'
import { Icon } from '../../ui/icons/icon'
import { yesNo } from '../../ui/overlays/buttons'
import { flexContainer } from '../../ui/css/flex'
import { memoInProduction } from '../../util/development'

import { getChasePreviewColor } from './utils'

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
    const [editingPresets, setEditingPresets] = useState(false)

    return (
      <div className={presetsContainer}>
        <div className={presetsInnerContainer}>
          {masterData.chaseColorPresets.length === 0 && (
            <i style={{ lineHeight: 2.4 }}>&nbsp; No presets saved.</i>
          )}
          {masterData.chaseColorPresets.map(preset => (
            <Clickable
              key={preset.id}
              onClick={async () => {
                if (editingPresets) {
                  const name = await showPromptDialog({
                    title: 'Rename Preset',
                    label: 'Name',
                    initialValue: preset.name,
                  })
                  if (!name) return
                  editEntity('chaseColorPresets', {
                    ...preset,
                    name,
                  })
                } else {
                  onChange(preset.colors)
                }
              }}
              className={presetContainer}
            >
              <div className={presetColors}>
                {preset.colors.map((color, index) => (
                  <div
                    key={index}
                    className={presetColor}
                    style={{
                      background: getChasePreviewColor(color),
                    }}
                  />
                ))}
              </div>
              <div className={presetName}>
                {preset.name}
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
                      onClick={async event => {
                        event.stopPropagation()
                        const result = await showDialog(
                          `Really delete color preset "${preset.name}"?`,
                          yesNo
                        )
                        if (result) {
                          return removeEntity('chaseColorPresets', preset.id)
                        }
                      }}
                    />
                  </>
                )}
              </div>
            </Clickable>
          ))}
        </div>

        <div>
          <Button
            icon={iconAdd}
            title="Save current state as preset"
            transparent
            onClick={async () => {
              const name = await showPromptDialog({
                title: 'Save as Preset',
                label: 'Name',
              })
              if (name === undefined) return

              editEntity('chaseColorPresets', {
                id: '',
                name,
                colors: getCurrentColors(),
              })
            }}
          />
          <br />
          {masterData.chaseColorPresets.length > 0 && (
            <Button
              icon={iconConfig}
              title="Rename or delete presets"
              transparent
              active={editingPresets ? true : undefined}
              onClick={async () => {
                setEditingPresets(!editingPresets)
              }}
            />
          )}
        </div>
      </div>
    )
  }
)
