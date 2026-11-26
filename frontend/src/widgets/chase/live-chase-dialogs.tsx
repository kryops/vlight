import {
  IdType,
  LiveChase,
  LiveChaseColorSelection,
  LiveChaseOrder,
  LiveChaseOrderAdvance,
  LiveChaseOrderDirection,
} from '@vlight/types'
import { useState } from 'react'
import { css } from '@linaria/core'

import { Label } from '../../ui/forms/label'
import { TextInput } from '../../ui/forms/typed-input'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { fixtureOrderEntries } from '../../ui/forms/fixture-order-entries'
import {
  ToggleButtonGroup,
  ToggleButtonGroupEntry,
} from '../../ui/forms/toggle-button-group'
import { showDialog, showDialogWithReturnValue } from '../../ui/overlays/dialog'
import { buttonCancel, buttonOk } from '../../ui/overlays/buttons'
import { iconRandom, iconSameColor, iconSameState } from '../../ui/icons'
import { baseline, textShade } from '../../ui/styles'
import { useApiStateEntry } from '../../hooks/api'

const noteStyle = css`
  margin-top: ${baseline(2)};
  color: ${textShade(1)};
  font-size: 80%;
`

type ColorMode = NonNullable<LiveChase['colorMode']>

export const colorModeEntries: (ToggleButtonGroupEntry<ColorMode> & {
  description: string
})[] = [
  {
    value: 'random',
    label: 'Per member',
    description: 'Colors are applied per member',
    icon: iconRandom,
  },
  {
    value: 'same-color',
    label: 'Same color',
    description:
      'The same color (but not state) is applied to all active members',
    icon: iconSameColor,
  },
  {
    value: 'same-state',
    label: 'Same state',
    description: 'The same state is applied to all active members',
    icon: iconSameState,
  },
]

const orderEntries: ToggleButtonGroupEntry<LiveChaseOrder>[] = [
  { value: 'random', label: 'Random' },
  ...fixtureOrderEntries,
]

const directionEntries: ToggleButtonGroupEntry<LiveChaseOrderDirection>[] = [
  { value: 'forward', label: 'Forward' },
  { value: 'backward', label: 'Backward' },
  { value: 'ping-pong', label: 'Ping-pong' },
]

const advanceEntries: ToggleButtonGroupEntry<LiveChaseOrderAdvance>[] = [
  {
    value: 'member',
    label: '1 member',
    title: 'The selection moves by one member with each step',
  },
  {
    value: 'selection',
    label: 'Selection',
    title: 'The selection moves by its own size with each step',
  },
]

const colorSelectionEntries: ToggleButtonGroupEntry<LiveChaseColorSelection>[] =
  [
    { value: 'random', label: 'Random' },
    {
      value: 'equal',
      label: 'Equal',
      title: 'The active members are distributed equally across all colors',
    },
    {
      value: 'sequential',
      label: 'Sequential',
      title: 'Colors are applied in order',
    },
  ]

/** Returns whether the chase uses any non-default mode options besides the color mode. */
export function hasCustomLiveChaseMode(state: LiveChase): boolean {
  return (
    (state.order ?? 'random') !== 'random' ||
    (state.colorSelection ?? 'random') !== 'random'
  )
}

/** Returns a description of the live chase's mode options. */
export function getLiveChaseModeDescription(state: LiveChase): string {
  const order = state.order ?? 'random'
  const orderLabel = orderEntries.find(it => it.value === order)?.label
  const selection =
    order === 'random'
      ? 'Random members'
      : `Members ordered by ${orderLabel} (${state.orderDirection ?? 'forward'})`
  const colorMode =
    colorModeEntries.find(it => it.value === state.colorMode) ??
    colorModeEntries[0]
  const colorSelection = state.colorSelection ?? 'random'

  return `Mode: ${selection}. ${colorMode.description} (${colorSelection} colors)`
}

interface LiveChaseModeEditorProps {
  id: IdType
  initialState: LiveChase
  onChange: (newState: Partial<LiveChase>) => void
  isAction: boolean
}

const LiveChaseModeEditor = ({
  id,
  initialState,
  onChange,
  isAction,
}: LiveChaseModeEditorProps) => {
  // Live chases display the server state, which stays in sync with other clients.
  // Actions are not updated from the outside, so they need a local state.
  const liveState = useApiStateEntry('liveChases', id)
  const [localState, setLocalState] = useState(initialState)
  const state = isAction ? localState : (liveState ?? localState)

  const update = (newState: Partial<LiveChase>) => {
    setLocalState(prev => ({ ...prev, ...newState }))
    onChange(newState)
  }

  const order = state.order ?? 'random'
  const colorMode = state.colorMode ?? 'random'
  const colorSelection = state.colorSelection ?? 'random'

  return (
    <>
      <Label
        label="Selection"
        input={
          <ToggleButtonGroup
            value={order}
            entries={orderEntries}
            onChange={order => update({ order })}
          />
        }
      />
      {order !== 'random' && (
        <>
          <Label
            label="Direction"
            input={
              <ToggleButtonGroup
                value={state.orderDirection ?? 'forward'}
                entries={directionEntries}
                onChange={orderDirection => update({ orderDirection })}
              />
            }
          />
          <Label
            label="Advance by"
            input={
              <ToggleButtonGroup
                value={state.orderAdvance ?? 'member'}
                entries={advanceEntries}
                onChange={orderAdvance => update({ orderAdvance })}
              />
            }
          />
        </>
      )}
      <Label
        label="Colors"
        input={
          <ToggleButtonGroup
            value={colorMode}
            entries={colorModeEntries}
            onChange={colorMode =>
              update(
                colorMode !== 'random' && colorSelection === 'equal'
                  ? { colorMode, colorSelection: 'random' }
                  : { colorMode }
              )
            }
          />
        }
      />
      <Label
        label="Color selection"
        input={
          <ToggleButtonGroup
            value={colorSelection}
            entries={colorSelectionEntries.filter(
              it => colorMode === 'random' || it.value !== 'equal'
            )}
            onChange={colorSelection => update({ colorSelection })}
          />
        }
      />
      {!isAction && (
        <div className={noteStyle}>
          Note: Any changes are applied immediately.
        </div>
      )}
    </>
  )
}

/**
 * Shows a dialog to change the selection and color options of a live chase.
 *
 * Changes are applied instantly.
 *
 * @param isAction set when editing an action, which hides the note about changes
 *   being applied immediately
 */
export async function showLiveChaseModeDialog(
  id: IdType,
  state: LiveChase,
  onChange: (newState: Partial<LiveChase>) => void,
  { isAction = false }: { isAction?: boolean } = {}
): Promise<void> {
  await showDialog(
    <LiveChaseModeEditor
      id={id}
      initialState={state}
      onChange={onChange}
      isAction={isAction}
    />,
    [buttonOk],
    { title: 'Chase Mode', showCloseButton: true }
  )
}

interface LiveChaseEditResult {
  name: string | undefined
  members: string[]
}

interface LiveChaseEditorProps {
  initialValue: LiveChaseEditResult
  showName: boolean
  onChange: (value: LiveChaseEditResult) => void
}

const LiveChaseEditor = ({
  initialValue,
  showName,
  onChange,
}: LiveChaseEditorProps) => {
  const [value, setValue] = useState(initialValue)
  const update = (newValue: Partial<LiveChaseEditResult>) => {
    const merged = { ...value, ...newValue }
    setValue(merged)
    onChange(merged)
  }

  return (
    <>
      {showName && (
        <Label
          label="Name"
          input={
            <TextInput value={value.name} onChange={name => update({ name })} />
          }
        />
      )}
      <FixtureListEditor
        value={value.members}
        onChange={members => update({ members })}
        ordering
        segments
      />
    </>
  )
}

/**
 * Shows a dialog to edit the name and members of a live chase.
 *
 * Returns the changes to apply, or `undefined` if the dialog was canceled.
 */
export async function showLiveChaseEditDialog({
  state,
  title,
  showName,
}: {
  state: LiveChase
  title: string
  showName: boolean
}): Promise<Partial<LiveChase> | undefined> {
  const initialValue: LiveChaseEditResult = {
    name: state.name,
    members: state.members,
  }
  const result = await showDialogWithReturnValue<LiveChaseEditResult>(
    onChange => (
      <LiveChaseEditor
        initialValue={initialValue}
        showName={showName}
        onChange={onChange}
      />
    ),
    [buttonOk, buttonCancel],
    { title, showCloseButton: true, initialValue }
  )
  if (!result) return undefined

  // An empty name is ignored
  return showName && result.name
    ? { name: result.name, members: result.members }
    : { members: result.members }
}
