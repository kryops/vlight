import { css } from '@linaria/core'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { primaryShade, baseline } from '../../../../ui/styles'
import { MemoryPreview } from '../../../../widgets/memory/memory-preview'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'

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
                  <a onClick={() => scenes.remove(scene)}>
                    <Icon icon={iconDelete} inline hoverable />
                  </a>
                </h3>
                <MemorySceneEditor
                  scene={scene}
                  onChange={newScene => scenes.update(scene, newScene)}
                />
              </div>
            ))}
            <a
              onClick={() =>
                scenes.add(
                  entityUiMapping.memories!.newEntityFactory!().scenes[0]
                )
              }
            >
              <Icon icon={iconAdd} inline /> Add scene
            </a>
          </>
        }
        right={<MemoryPreview scenes={scenes.value} displayFixtureOrder />}
        rightClassName={editorPreviewColumn}
        fixed
      />
    </>
  )
}
