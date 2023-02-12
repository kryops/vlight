import { css } from '@linaria/core'
import { MemoryScene, MemorySceneState } from '@vlight/types'
import { useCallback } from 'react'

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
  min-width: ${baseline(28)};
  cursor: pointer;
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
  hideFixtureList?: boolean
}

/**
 * Editor for a memory scene.
 *
 * Displays a fixture list selection as well as a list of memory states.
 */
export const MemorySceneEditor = memoInProduction(
  ({ scene, onChange, compact, hideFixtureList }: MemorySceneEditorProps) => {
    const members = useShallowEqualMemo(scene.members)

    const onChangeWrapper = useEvent((changes: Partial<MemoryScene>) =>
      onChange({ ...scene, ...changes }, scene)
    )

    const changeMembers = useEvent((newValue: string[]) =>
      onChangeWrapper({ members: newValue })
    )

    const addState = useEvent(() =>
      onChangeWrapper({
        states: [...scene.states, newMemoryFactory().scenes[0].states[0]],
      })
    )

    const changeStates = useEvent((newValue: MemorySceneState[]) =>
      onChangeWrapper({ states: newValue })
    )

    const renderEntryContent = useCallback(
      (state: MemorySceneState) => (
        <>
          <div
            className={flexAuto}
            style={{
              background: getMemorySceneStatePreviewBackground(state),
            }}
            onClick={async () => {
              const result = await showDialogWithReturnValue<MemorySceneState>(
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
              if (result) {
                changeStates(
                  scene.states.map(it => (it === state ? result : it))
                )
              }
            }}
          />
          <Icon
            icon={iconDelete}
            padding
            onClick={() =>
              changeStates(scene.states.filter(it => it !== state))
            }
          />
        </>
      ),
      [changeStates, scene]
    )

    const changePattern = useEvent(
      (newValue: MemoryScene['pattern'] | undefined): void =>
        onChange({ ...scene, pattern: newValue }, scene)
    )

    return (
      <>
        {!hideFixtureList && (
          <FixtureListInput
            value={members}
            onChange={changeMembers}
            ordering
            compact={compact}
          />
        )}
        States <Icon icon={iconAdd} hoverable inline onClick={addState} />
        <br />
        <br />
        <SortableList
          entries={scene.states}
          onChange={changeStates}
          entryClassName={stateStyle}
          renderEntryContent={renderEntryContent}
        />
        {scene.states.length >= 2 && (
          <Select
            entries={memoryScenePatternEntries}
            value={scene.pattern}
            onChange={changePattern}
          />
        )}
      </>
    )
  }
)
