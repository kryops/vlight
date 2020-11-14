import { css } from 'linaria'
import { MemoryScene, MemorySceneState } from '@vlight/types'

import { entityUiMapping } from '../entity-ui-mapping'
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
  onChange: (scene: MemoryScene) => void
  compact?: boolean
}

export function MemorySceneEditor({
  scene,
  onChange,
  compact,
}: MemorySceneEditorProps) {
  return (
    <>
      <FixtureListInput
        value={scene.members}
        onChange={newValue => onChange({ ...scene, members: newValue })}
        ordering
        compact={compact}
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
                onChange({
                  ...scene,
                  states: [
                    ...scene.states,
                    entityUiMapping.memories.newEntityFactory!().scenes[0]
                      .states[0],
                  ],
                })
              }
            />
          </>
        }
        input={
          scene.states.length >= 2 && (
            <>
              Pattern: &nbsp;
              <Select
                entries={memoryScenePatternEntries}
                value={scene.pattern}
                onChange={newValue => onChange({ ...scene, pattern: newValue })}
              />
            </>
          )
        }
      />
      <SortableList
        entries={scene.states}
        onChange={newValue => onChange({ ...scene, states: newValue })}
        entryClassName={stateStyle}
        renderEntryContent={state => (
          <>
            <div
              className={flexAuto}
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
                  okCancel,
                  { showCloseButton: true }
                )
                if (result)
                  onChange({
                    ...scene,
                    states: scene.states.map(it =>
                      it === state ? result : it
                    ),
                  })
              }}
            />
            <Icon
              icon={iconDelete}
              padding
              onClick={() =>
                onChange({
                  ...scene,
                  states: scene.states.filter(it => it !== state),
                })
              }
            />
          </>
        )}
      />
    </>
  )
}
