import { css } from '@linaria/core'
import { MemoryScene, MemorySceneState } from '@vlight/types'

import { Label } from '../../../../ui/forms/label'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { baseline, iconShade } from '../../../../ui/styles'
import { Select, SelectEntry } from '../../../../ui/forms/select'
import { getMemorySceneStatePreviewBackground } from '../../../../util/memories'
import { showDialogWithReturnValue } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import { FixtureListInput } from '../../../../ui/forms/fixture-list-input'
import { SortableList } from '../../../../ui/containers/sortable-list'
import { flexAuto } from '../../../../ui/css/flex'
import { newMemoryFactory } from '../new-entity-factories'
import { useEvent, useShallowEqualMemo } from '../../../../hooks/performance'
import { memoInProduction } from '../../../../util/development'

import { MemorySceneStateEditor } from './memory-scene-state-editor'

const stateStyle = css`
  display: flex;
  margin-bottom: ${baseline()};
  border: 1px solid ${iconShade(0)};
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

export interface MemorySceneEditorProps {
  scene: MemoryScene
  onChange: (scene: MemoryScene, oldScene: MemoryScene) => void
  compact?: boolean
}

/**
 * Editor for a memory scene.
 *
 * Displays a fixture list selection as well as a list of memory states.
 */
export const MemorySceneEditor = memoInProduction(
  ({ scene, onChange, compact }: MemorySceneEditorProps) => {
    const members = useShallowEqualMemo(scene.members)
    const changeMembers = useEvent((newValue: string[]) =>
      onChange({ ...scene, members: newValue }, scene)
    )

    const addState = useEvent(() =>
      onChange(
        {
          ...scene,
          states: [...scene.states, newMemoryFactory().scenes[0].states[0]],
        },
        scene
      )
    )

    return (
      <>
        <FixtureListInput
          value={members}
          onChange={changeMembers}
          ordering
          compact={compact}
        />
        <Label
          label={
            <>
              States <Icon icon={iconAdd} hoverable inline onClick={addState} />
            </>
          }
          input={
            scene.states.length >= 2 && (
              <>
                Pattern: &nbsp;
                <Select
                  entries={memoryScenePatternEntries}
                  value={scene.pattern}
                  onChange={newValue =>
                    onChange({ ...scene, pattern: newValue }, scene)
                  }
                />
              </>
            )
          }
        />
        <SortableList
          entries={scene.states}
          onChange={newValue => onChange({ ...scene, states: newValue }, scene)}
          entryClassName={stateStyle}
          renderEntryContent={state => (
            <>
              <div
                className={flexAuto}
                style={{
                  background: getMemorySceneStatePreviewBackground(state),
                }}
                onClick={async () => {
                  const result =
                    await showDialogWithReturnValue<MemorySceneState>(
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
                    onChange(
                      {
                        ...scene,
                        states: scene.states.map(it =>
                          it === state ? result : it
                        ),
                      },
                      scene
                    )
                }}
              />
              <Icon
                icon={iconDelete}
                padding
                onClick={() =>
                  onChange(
                    {
                      ...scene,
                      states: scene.states.filter(it => it !== state),
                    },
                    scene
                  )
                }
              />
            </>
          )}
        />
      </>
    )
  }
)
