import { css } from '@linaria/core'
import { MemoryScene } from '@vlight/types'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { primaryShade, baseline } from '../../../../ui/styles'
import { MemoryPreview } from '../../../../widgets/memory/memory-preview'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'
import { newMemoryFactory } from '../new-entity-factories'
import { useEvent } from '../../../../hooks/performance'
import { Button } from '../../../../ui/buttons/button'

import { MemorySceneEditor } from './memory-scene-editor'

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

  const changeScene = useEvent(
    (newScene: MemoryScene, oldScene: MemoryScene) => {
      scenes.update(oldScene, newScene)
    }
  )

  const removeScene = useEvent((_event: any, scene: MemoryScene) =>
    scenes.remove(scene)
  )

  const addScene = useEvent(() => scenes.add(newMemoryFactory().scenes[0]))

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
            {scenes.value.map((scene, sceneIndex) => (
              <div key={sceneIndex} className={sceneStyle}>
                <h3>
                  Scene {sceneIndex + 1}{' '}
                  <Button<MemoryScene>
                    icon={iconDelete}
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
        right={<MemoryPreview scenes={scenes.value} displayFixtureOrder />}
        rightClassName={editorPreviewColumn}
        fixed
      />
    </>
  )
}
