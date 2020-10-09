import React from 'react'
import { css } from 'linaria'
import { MemoryScene, MemorySceneState } from '@vlight/types'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { primaryShade, baseline, iconShade } from '../../../../ui/styles'
import { useClassNames } from '../../../../hooks/ui'
import { Select, SelectEntry } from '../../../../ui/forms/select'
import { getMemorySceneStatePreviewBackground } from '../../../../util/memories'
import { showDialogWithReturnValue } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import { MemoryPreview } from '../../../../widgets/memory/memory-preview'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import { FixtureListInput } from '../../../../ui/forms/fixture-list-input'

import { MemorySceneStateEditor } from './memory-scene-state-editor'

const title = css`
  margin-top: 0;
`

const sceneStyle = css`
  padding: ${baseline(2)};
  margin: 0 ${baseline(-2)} ${baseline(2)} ${baseline(-2)};
  background: ${primaryShade(1)};
`

const sceneStyle_light = css`
  background: ${primaryShade(2, true)};
`

const stateStyle = css`
  display: flex;
  margin-bottom: ${baseline()};
  border: 1px solid ${iconShade(0)};
`

const stateStyle_light = css`
  border: 1px solid ${iconShade(0, true)};
`

const statePreview = css`
  flex: 1 1 auto;
`

const previewColumn = css`
  text-align: center;
`

const memoryScenePatternEntries: SelectEntry<MemoryScene['pattern']>[] = [
  {
    value: 'row',
    label: 'In a row',
  },
  {
    value: 'alternate',
    label: 'Alternating',
  },
]

export function MemoryEditor({
  entry,
  onChange,
}: EntityEditorProps<'memories'>) {
  const formState = useFormState(entry, { onChange })
  const scenes = useFormStateArray(formState, 'scenes')

  const [sceneClass, stateClass] = useClassNames(
    [sceneStyle, sceneStyle_light],
    [stateStyle, stateStyle_light]
  )

  function changeSceneProperty<TKey extends keyof MemoryScene>(
    scene: MemoryScene,
    key: TKey,
    value: MemoryScene[TKey]
  ) {
    scenes.update(scene, { ...scene, [key]: value })
  }

  return (
    <>
      <h2 className={title}>{entry.id ? 'Edit' : 'Add'} Memory</h2>
      <TwoColumDialogContainer
        left={
          <>
            <Label
              label="Name"
              input={<FormTextInput formState={formState} name="name" />}
            />
            <h3>Scenes</h3>
            {scenes.value.map((scene, sceneIndex) => (
              <div key={sceneIndex} className={sceneClass}>
                <h3>
                  Scene {sceneIndex + 1}{' '}
                  <a onClick={() => scenes.remove(scene)}>
                    <Icon icon={iconDelete} inline hoverable />
                  </a>
                </h3>
                <FixtureListInput
                  value={scene.members}
                  onChange={newValue =>
                    changeSceneProperty(scene, 'members', newValue)
                  }
                  ordering
                />
                <Label
                  label={
                    <>
                      States{' '}
                      <Icon
                        icon={iconAdd}
                        hoverable
                        inline
                        onClick={() =>
                          changeSceneProperty(scene, 'states', [
                            ...scene.states,
                            entityUiMapping.memories.newEntityFactory!()
                              .scenes[0].states[0],
                          ])
                        }
                      />
                    </>
                  }
                  input={
                    <>
                      Pattern: &nbsp;
                      <Select
                        entries={memoryScenePatternEntries}
                        value={scene.pattern}
                        onChange={newValue =>
                          changeSceneProperty(scene, 'pattern', newValue)
                        }
                      />
                    </>
                  }
                />
                <DragDropContext
                  onDragEnd={result => {
                    if (!result.destination) return

                    const newValue = [...scene.states]
                    const [removed] = newValue.splice(result.source.index, 1)
                    newValue.splice(result.destination.index, 0, removed)

                    changeSceneProperty(scene, 'states', newValue)
                  }}
                >
                  <Droppable
                    droppableId="memoryEditor_states"
                    isDropDisabled={scene.states.length < 2}
                  >
                    {provided => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {scene.states.map((state, stateIndex) => (
                          <Draggable
                            key={stateIndex}
                            draggableId={String(stateIndex)}
                            index={stateIndex}
                            isDragDisabled={scene.states.length < 2}
                          >
                            {provided => (
                              <div
                                key={stateIndex}
                                className={stateClass}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div
                                  className={statePreview}
                                  style={{
                                    background: getMemorySceneStatePreviewBackground(
                                      state
                                    ),
                                  }}
                                  onClick={async () => {
                                    const result = await showDialogWithReturnValue<
                                      MemorySceneState
                                    >(
                                      onChange => (
                                        <MemorySceneStateEditor
                                          scene={scene}
                                          state={state}
                                          onChange={onChange}
                                        />
                                      ),
                                      okCancel,
                                      { showCloseButton: true }
                                    )
                                    if (result)
                                      changeSceneProperty(
                                        scene,
                                        'states',
                                        scene.states.map(it =>
                                          it === state ? result : it
                                        )
                                      )
                                  }}
                                />
                                <Icon
                                  icon={iconDelete}
                                  padding
                                  onClick={() =>
                                    changeSceneProperty(
                                      scene,
                                      'states',
                                      scene.states.filter(it => it !== state)
                                    )
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ))}
            <a
              onClick={() =>
                scenes.add(
                  entityUiMapping.memories.newEntityFactory!().scenes[0]
                )
              }
            >
              <Icon icon={iconAdd} inline /> Add scene
            </a>
          </>
        }
        right={<MemoryPreview scenes={scenes.value} />}
        rightClassName={previewColumn}
        fixed
      />
    </>
  )
}
