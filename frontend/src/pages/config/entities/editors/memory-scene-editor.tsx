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
import { flexAuto, flexContainer } from '../../../../ui/css/flex'
import { newMemoryFactory } from '../new-entity-factories'
import { useEvent, useShallowEqualMemo } from '../../../../hooks/performance'
import { memoInProduction } from '../../../../util/development'
import { cx } from '../../../../util/styles'

import { MemorySceneStateEditor } from './memory-scene-state-editor'

const statesControls = css`
  justify-content: space-between;
  margin-bottom: ${baseline()};
  flex-wrap: wrap;
`

const statesControls__compact = css`
  flex-direction: column;
`

const stateStyle = css`
  display: flex;
  margin-bottom: ${baseline()};
  border: 1px solid ${iconShade(0)};
  height: ${baseline(10)};
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

const memorySceneOrderEntries: SelectEntry<MemoryScene['order']>[] = [
  {
    value: 'members',
    label: 'Index',
  },
  {
    value: 'xcoord',
    label: 'X coord',
  },
  {
    value: 'ycoord',
    label: 'Y coord',
  },
  {
    value: 'x+y',
    label: 'X+Y',
  },
  {
    value: 'x-y',
    label: 'X-Y',
  },
]

export interface MemorySceneEditorProps {
  scene: MemoryScene
  onChange: (scene: MemoryScene, oldScene: MemoryScene) => void
  hideFixtureList?: boolean
  compact?: boolean
}

/**
 * Editor for a memory scene.
 *
 * Displays a fixture list selection as well as a list of memory states.
 */
export const MemorySceneEditor = memoInProduction(
  ({ scene, onChange, hideFixtureList, compact }: MemorySceneEditorProps) => {
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
          {scene.states.length > 1 && (
            <Icon
              icon={iconDelete}
              padding
              onClick={() =>
                changeStates(scene.states.filter(it => it !== state))
              }
            />
          )}
        </>
      ),
      [changeStates, scene]
    )

    const changePattern = useEvent(
      (newValue: MemoryScene['pattern'] | undefined): void =>
        onChange({ ...scene, pattern: newValue }, scene)
    )

    const changeOrder = useEvent(
      (newValue: MemoryScene['order'] | undefined): void =>
        onChange({ ...scene, order: newValue }, scene)
    )

    return (
      <>
        {!hideFixtureList && (
          <FixtureListInput
            value={members}
            onChange={changeMembers}
            ordering
            compact
          />
        )}
        <div
          className={cx(
            flexContainer,
            statesControls,
            compact && statesControls__compact
          )}
        >
          <div>
            States <Icon icon={iconAdd} hoverable inline onClick={addState} />
          </div>
          {scene.states.length >= 2 && (
            <div>
              <Select
                entries={memoryScenePatternEntries}
                value={scene.pattern}
                onChange={changePattern}
              />
            </div>
          )}
          <div>
            Order:{' '}
            <Select
              entries={memorySceneOrderEntries}
              value={scene.order}
              onChange={changeOrder}
            />
          </div>
        </div>
        <SortableList
          entries={scene.states}
          onChange={changeStates}
          entryClassName={stateStyle}
          renderEntryContent={renderEntryContent}
        />
      </>
    )
  }
)
