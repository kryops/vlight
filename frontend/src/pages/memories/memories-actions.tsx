import { useState } from 'react'
import { Link } from 'react-router'
import { IdType } from '@vlight/types'
import { FixtureState, Memory, MemoryScene } from '@vlight/types/entities'

import { setLiveMemoryState, setMemoryState } from '../../api'
import { Button } from '../../ui/buttons/button'
import {
  iconAdd,
  iconConfig,
  iconLight,
  iconLightOff,
  iconStop,
} from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { isAnyOn, isAllOn } from '../../util/state'
import { entitiesPageRoute } from '../routes'
import { openEntityEditor } from '../config/entities/editors'
import { HotkeyContext } from '../../hooks/hotkey'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { showDialogWithReturnValue } from '../../ui/overlays/dialog'
import { okCancel } from '../../ui/overlays/buttons'
import { Label } from '../../ui/forms/label'
import { Select, SelectEntry } from '../../ui/forms/select'
import { TextInput } from '../../ui/forms/typed-input'
import {
  editEntityWithCustomLogic,
  entityUiMapping,
} from '../config/entities/entity-ui-mapping'

function setOnForAllMemories(on: boolean) {
  setMemoryState(
    apiState.masterData!.memories.map(it => it.id),
    { on },
    true
  )
  Object.entries(apiState.liveMemories).forEach(([id, liveMemory]) => {
    if (liveMemory.on !== on) {
      setLiveMemoryState(id, { on }, true)
    }
  })
}

export function stopAllMemories() {
  Object.entries(apiState.liveMemories).forEach(([id, liveMemory]) => {
    if (liveMemory.gradientMovement) {
      setLiveMemoryState(id, { gradientMovement: false }, true)
    }
  })
}

export function isAnyMemoryOn(apiState: ApiState) {
  return isAnyOn(apiState.memories) || isAnyOn(apiState.liveMemories)
}

export function isAnyMemoryRunning(apiState: ApiState) {
  return Object.values(apiState.liveMemories).some(
    liveMemory => liveMemory.gradientMovement
  )
}

export const turnAllMemoriesOn = () => setOnForAllMemories(true)
export const turnAllMemoriesOff = () => setOnForAllMemories(false)

const addMemory = () => openEntityEditor('memories')

interface SaveAsMemoryDialogResult {
  /** ID of an existing memory to add the scene to, `undefined` to create a new memory. */
  memoryId: IdType | undefined
  name: string | undefined
}

const SaveAsMemoryForm = ({
  memories,
  initialValue,
  onChange,
  close,
}: {
  memories: Memory[]
  initialValue: SaveAsMemoryDialogResult
  onChange: (newValue: SaveAsMemoryDialogResult) => void
  close: (success: boolean) => void
}) => {
  const [value, setValue] = useState(initialValue)
  const update = (newValue: SaveAsMemoryDialogResult) => {
    setValue(newValue)
    onChange(newValue)
  }

  const memoryEntries: SelectEntry<IdType | undefined>[] = [
    { value: undefined, label: '(New Memory)' },
    ...memories
      .map(({ id, name }) => ({ value: id, label: name ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ]

  return (
    <>
      {memories.length > 0 && (
        <Label
          label="Memory"
          input={
            <Select
              entries={memoryEntries}
              value={value.memoryId}
              onChange={memoryId => update({ ...value, memoryId })}
            />
          }
        />
      )}
      {value.memoryId === undefined && (
        <Label
          label="Name"
          input={
            <TextInput
              value={value.name}
              onChange={name => update({ ...value, name })}
              autoFocus
              onKeyDown={event => {
                if (event.key === 'Enter') close(true)
              }}
            />
          }
        />
      )}
    </>
  )
}

/**
 * Saves the given fixture state as a new scene, either in a new memory
 * or appended to an existing one.
 */
export const addMemoryFromFixtureState = async ({
  fixtureState,
  members,
  initialName,
}: {
  fixtureState: FixtureState
  members: string[]
  initialName?: string
}) => {
  const memories = apiState.rawMasterData!.memories
  const initialValue: SaveAsMemoryDialogResult = {
    memoryId: undefined,
    name: initialName,
  }

  const result = await showDialogWithReturnValue<SaveAsMemoryDialogResult>(
    (onChange, close) => (
      <SaveAsMemoryForm
        memories={memories}
        initialValue={initialValue}
        onChange={onChange}
        close={close}
      />
    ),
    okCancel,
    { title: 'Save into Memory', initialValue }
  )

  if (!result) return

  const scene: MemoryScene = {
    members,
    states: [
      {
        ...fixtureState,
        on: true,
      },
    ],
  }

  if (result.memoryId !== undefined) {
    const memory = apiState.rawMasterData!.memories.find(
      it => it.id === result.memoryId
    )
    if (!memory) return
    editEntityWithCustomLogic('memories', {
      ...memory,
      scenes: [...memory.scenes, scene],
    })
    return
  }

  if (!result.name) return

  editEntityWithCustomLogic('memories', {
    id: '',
    ...entityUiMapping.memories?.newEntityFactory?.(),
    name: result.name,
    scenes: [scene],
  })
}

/**
 * Corner actions for the memories page:
 * - Add memory
 * - Configure
 * - All on
 * - All off
 */
export function MemoriesActions() {
  const { allOn, allOff, allStopped } = useApiStateSelector(apiState => ({
    allOn: isAllOn(apiState.memories) && isAllOn(apiState.liveMemories),
    allOff: !isAnyMemoryOn(apiState),
    allStopped: !isAnyMemoryRunning(apiState),
  }))

  return (
    <HotkeyContext value={true}>
      <Button
        title="Add memory"
        icon={iconAdd}
        transparent
        onClick={addMemory}
      />
      <Link to={entitiesPageRoute('memories')}>
        <Button title="Configure memories" icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconStop}
        onClick={stopAllMemories}
        disabled={allStopped}
        title="Stop"
        hotkey="i"
      >
        STOP
      </Button>
      <Button
        icon={iconLight}
        onClick={turnAllMemoriesOn}
        disabled={allOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllMemoriesOff}
        disabled={allOff}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext>
  )
}
