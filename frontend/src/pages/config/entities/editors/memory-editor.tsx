import { css } from '@linaria/core'
import { MemoryScene } from '@vlight/types'
import { useState } from 'react'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import {
  FormNumberInput,
  FormSelect,
  FormTextInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { iconAdd, iconDelete, iconLight } from '../../../../ui/icons'
import { primaryShade, baseline } from '../../../../ui/styles'
import { MemoryPreview } from '../../../../widgets/memory/memory-preview'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'
import { newMemoryFactory } from '../new-entity-factories'
import { Button } from '../../../../ui/buttons/button'
import { editEntity, removeEntity, setMemoryState } from '../../../../api'
import { apiState } from '../../../../api/api-state'
import { getMasterDataMaps } from '../../../../api/masterdata'

import { MemorySceneEditor } from './memory-scene-editor'

const previewId = '__preview'

const sceneStyle = css`
  padding: ${baseline(2)};
  margin: ${baseline(2)} ${baseline(-2)};
  border: 1px solid ${primaryShade(1)};
`

/**
 * Dialog content to edit a memory.
 *
 * Displays editors for the memory's scenes as well as a map preview.
 */
export function MemoryEditor({
  entry,
  onChange,
}: EntityEditorProps<'memories'>) {
  const formState = useFormState(entry, { onChange })
  const scenes = useFormStateArray(formState, 'scenes')
  const [onBeforePreview, setOnBeforePreview] = useState(false)

  const changeScene = (newScene: MemoryScene, oldScene: MemoryScene) => {
    scenes.update(oldScene, newScene)
  }

  const removeScene = (_event: any, scene: MemoryScene) => scenes.remove(scene)

  const addScene = () => scenes.add(newMemoryFactory().scenes[0])

  return (
    <>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Memory</h2>
      <TwoColumDialogContainer
        left={
          <>
            <Label
              label="Name"
              input={<FormTextInput formState={formState} name="name" />}
            />
            <Label
              label="Display as"
              input={
                <FormSelect
                  formState={formState}
                  name="display"
                  entries={[
                    { value: 'both', label: 'Fader and buttons' },
                    { value: 'fader', label: 'Fader' },
                    { value: 'flash', label: 'Flash button' },
                    { value: 'toggle', label: 'Toggle button' },
                  ]}
                />
              }
            />
            {(formState.values.display ?? 'both') === 'both' && (
              <Label
                label="Fade time (s)"
                input={
                  <FormNumberInput
                    formState={formState}
                    name="fade"
                    min={0}
                    step={0.1}
                    placeholder="1"
                  />
                }
              />
            )}
            {scenes.value.map((scene, sceneIndex) => (
              <div key={sceneIndex} className={sceneStyle}>
                <h3>
                  Scene {sceneIndex + 1}{' '}
                  <Button<MemoryScene>
                    icon={iconDelete}
                    title="Remove scene"
                    transparent
                    onClick={removeScene}
                    onClickArg={scene}
                  />
                </h3>
                <MemorySceneEditor scene={scene} onChange={changeScene} />
              </div>
            ))}
            <Button icon={iconAdd} transparent onClick={addScene}>
              Add scene
            </Button>
          </>
        }
        right={
          <>
            <MemoryPreview scenes={scenes.value} displayFixtureOrder />
            <Button
              icon={iconLight}
              onDown={async () => {
                const on = apiState.memories[entry.id]?.on ?? false
                const memory =
                  apiState.rawMasterData?.memories.find(
                    it => it.id === entry.id
                  ) ?? entry

                setOnBeforePreview(on)
                editEntity(
                  'memories',
                  {
                    ...memory,
                    scenes: scenes.value,
                    id: previewId,
                    name: '(Preview)',
                  },
                  true
                )

                let i = 0
                while (
                  !getMasterDataMaps().memories.get(previewId) &&
                  i++ < 100
                ) {
                  await new Promise(resolve => setTimeout(resolve, 10))
                }

                setMemoryState(previewId, { on: true }, true)
                if (on) setMemoryState(entry.id, { on: false }, true)
              }}
              onUp={() => {
                removeEntity('memories', previewId)
                if (onBeforePreview) {
                  setMemoryState(entry.id, { on: true }, true)
                }
              }}
            >
              Preview
            </Button>
          </>
        }
        rightClassName={editorPreviewColumn}
        fixed
      />
    </>
  )
}
