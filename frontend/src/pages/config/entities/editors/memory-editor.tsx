import React from 'react'
import { MemoryScene, Memory } from '@vlight/entities'
import { css } from 'linaria'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { ArrayInput } from '../../../../ui/forms/array-input'
import { FixtureInput } from '../../../../ui/forms/fixture-input'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { primaryShade, baseline } from '../../../../ui/styles'
import { useClassName } from '../../../../hooks/ui'

const sceneStyle = css`
  padding: ${baseline(2)};
  margin: 0 ${baseline(-2)} ${baseline(2)} ${baseline(-2)};
  background: ${primaryShade(1)};
`

const sceneStyle_light = css`
  background: ${primaryShade(1, true)};
`

// TODO unfinished
export function MemoryEditor({
  entry,
  onChange,
}: EntityEditorProps<'memories'>) {
  const formState = useFormState(entry, { onChange })
  const scenes = useFormStateArray(formState, 'scenes')

  const sceneClass = useClassName(sceneStyle, sceneStyle_light)

  function changeSceneProperty<TKey extends keyof MemoryScene>(
    scene: MemoryScene,
    key: TKey,
    value: MemoryScene[TKey]
  ) {
    scenes.update(scene, { ...scene, [key]: value })
  }

  return (
    <>
      <h2>{entry.id ? 'Edit' : 'Add'} Memory</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <h3>Scenes</h3>
      {scenes.value.map((scene, index) => (
        <div key={index} className={sceneClass}>
          <Label
            label="Fixtures"
            input={
              <ArrayInput
                value={scene.members}
                onChange={newValue =>
                  changeSceneProperty(scene, 'members', newValue)
                }
                Input={FixtureInput}
                displayRemoveButtons
              />
            }
          />
          <a onClick={() => scenes.remove(scene)}>
            <Icon icon={iconDelete} inline /> Remove scene
          </a>
        </div>
      ))}
      <a
        onClick={() =>
          scenes.add({
            members: [],
            states: [{ channels: { r: 255 }, on: true }],
          })
        }
      >
        <Icon icon={iconAdd} inline /> Add scene
      </a>
    </>
  )
}
