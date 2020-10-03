import React from 'react'
import { css } from 'linaria'
import { MemoryScene, MemorySceneState } from '@vlight/types'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { ArrayInput } from '../../../../ui/forms/array-input'
import { FixtureInput } from '../../../../ui/forms/fixture-input'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { primaryShade, baseline, iconShade } from '../../../../ui/styles'
import { useClassNames } from '../../../../hooks/ui'
import { Select, SelectEntry } from '../../../../ui/forms/select'
import { getMemorySceneStatePreviewBackground } from '../../../../util/memories'
import { showDialogWithReturnValue } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import { MemoryPreview } from '../../../../widgets/memory/memory-preview'
import { cx } from '../../../../util/styles'

import { MemorySceneStateEditor } from './memory-scene-state-editor'

const breakpoint = '700px'

const container = css`
  @media (min-width: ${breakpoint}) {
    width: 80vw;
    max-width: 1200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
`

const column = css`
  flex: 1 1 auto;
  flex-basis: 50%;

  margin-right: ${baseline(4)};

  &:last-child {
    margin-right: 0;
    margin-top: ${baseline(4)};

    @media (min-width: ${breakpoint}) {
      margin-top: 0;
    }
  }
`

const previewColumn = css`
  min-width: ${baseline(64)};
  max-width: ${baseline(96)};
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
      <h2>{entry.id ? 'Edit' : 'Add'} Memory</h2>
      <div className={container}>
        <div className={column}>
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
                          entityUiMapping.memories.newEntityFactory!().scenes[0]
                            .states[0],
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
              {scene.states.map((state, stateIndex) => (
                <div key={stateIndex} className={stateClass}>
                  <div
                    className={statePreview}
                    style={{
                      background: getMemorySceneStatePreviewBackground(state),
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
                        okCancel
                      )
                      if (result)
                        changeSceneProperty(
                          scene,
                          'states',
                          scene.states.map(it => (it === state ? result : it))
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
              ))}
            </div>
          ))}
          <a
            onClick={() =>
              scenes.add(entityUiMapping.memories.newEntityFactory!().scenes[0])
            }
          >
            <Icon icon={iconAdd} inline /> Add scene
          </a>
        </div>
        <div className={cx(column, previewColumn)}>
          <MemoryPreview scenes={scenes.value} />
        </div>
      </div>
    </>
  )
}
