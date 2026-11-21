import { css } from '@linaria/core'
import {
  ButtonAction,
  ChannelsAction,
  DmxMasterAction,
  GlobalControl,
  GlobalControlAction,
  IdType,
  NamedActionsAction,
  SequenceAction,
  SequenceControl,
} from '@vlight/types'
import { createRangeArray, ensureBetween } from '@vlight/utils'
import { useCallback, useState } from 'react'

import { useApiState, useMasterDataAndMaps } from '../../../../../hooks/api'
import { useShallowEqualMemo } from '../../../../../hooks/performance'
import { MultiToggleInput } from '../../../../../ui/forms/multi-toggle-input'
import { ArrayInput } from '../../../../../ui/forms/array-input'
import { EntityReferenceSelect } from '../../../../../ui/forms/entity-reference-select'
import { TwoColumDialogContainer } from '../../../../../ui/containers/two-column-dialog'
import { getUniverseIndex } from '../../../../../api/util'
import { Widget } from '../../../../../ui/containers/widget'
import { ChannelFader } from '../../../../../ui/controls/fader/channel-fader'
import { Fader } from '../../../../../ui/controls/fader/fader'
import { faderContainer } from '../../../../../ui/css/fader-container'
import { Label } from '../../../../../ui/forms/label'
import { Select, SelectEntry } from '../../../../../ui/forms/select'
import { NumberInput } from '../../../../../ui/forms/typed-input'
import { iconFader, iconGlobal } from '../../../../../ui/icons'
import { baseline } from '../../../../../ui/styles'

import { getChangedValues } from './action-utils'
import { ActionEditorProps } from './entity-action-editors'
import { StateChangesList } from './state-changes-list'

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
`

const widgetContainer = css`
  display: flex;
  margin: 0 ${baseline(-1)};
`

/** The number of channels displayed starting from the selected one. */
const displayedChannels = 100

/**
 * Editor for actions that set DMX channels.
 */
export function ChannelsActionEditor({
  action,
  onChange,
}: ActionEditorProps<ChannelsAction>) {
  const channelValues = useApiState('channels')
  const recordedChannels = Object.keys(action.channels ?? {}).map(Number)

  const [from, setFrom] = useState(
    recordedChannels.length ? Math.min(...recordedChannels) : 1
  )
  const to = Math.min(from + displayedChannels - 1, 512)

  const changeFrom = (value: number | undefined) =>
    setFrom(ensureBetween(value ?? 1, 1, 512))

  const getValue = (channel: number) =>
    action.channels?.[channel] ?? channelValues[getUniverseIndex(channel)] ?? 0

  const changeChannel = (channel: number, value: number) => {
    if (value === getValue(channel)) return
    onChange({
      ...action,
      channels: { ...action.channels, [channel]: value },
    })
  }

  return (
    <>
      <Label
        label="From channel"
        input={
          <NumberInput value={from} onChange={changeFrom} min={1} max={512} />
        }
      />
      <div className={widgetContainer}>
        <Widget icon={iconFader} title={`Channels ${from} - ${to}`}>
          <div className={faderContainer}>
            {createRangeArray(from, to).map(channel => (
              <ChannelFader
                key={channel}
                channel={channel}
                value={getValue(channel)}
                onChange={changeChannel}
              />
            ))}
          </div>
        </Widget>
      </div>
      <StateChangesList
        state={action.channels ?? {}}
        onChange={channels => onChange({ ...action, channels })}
        getLabel={([channel]) => `Channel ${channel}`}
      />
    </>
  )
}

/**
 * Editor for actions that change the DMX master.
 */
export function DmxMasterActionEditor({
  action,
  onChange,
}: ActionEditorProps<DmxMasterAction>) {
  const dmxMaster = useApiState('dmxMaster')
  const dmxMasterFade = useApiState('dmxMasterFade')

  // only the DMX master values are changes (not e.g. the `revert` flag of button actions)
  const state: Pick<DmxMasterAction, 'value' | 'fade'> = {
    ...(action.value !== undefined && { value: action.value }),
    ...(action.fade !== undefined && { fade: action.fade }),
  }
  const value = action.value ?? dmxMaster
  const fade = action.fade ?? dmxMasterFade

  const change = (newChange: Partial<typeof state>) =>
    onChange({
      ...action,
      ...getChangedValues({ value, fade }, newChange),
    })

  return (
    <>
      <div className={widgetContainer}>
        <Widget icon={iconGlobal} title="DMX Master">
          <div className={faderContainer}>
            <Fader
              max={255}
              step={1}
              value={value}
              onChange={newValue => change({ value: newValue })}
            />
            <Fader
              min={10}
              max={0}
              value={fade}
              onChange={newFade => change({ fade: newFade })}
              label="Fade"
              subLabel={fade === 0 ? 'Instant' : `${fade.toFixed(2)}s`}
            />
          </div>
        </Widget>
      </div>
      <StateChangesList
        state={state}
        onChange={newState =>
          onChange({
            ...action,
            value: newState.value,
            fade: newState.fade,
          })
        }
      />
    </>
  )
}

const globalControlEntries: SelectEntry<GlobalControl>[] = [
  { value: 'all-off', label: 'All off' },
  { value: 'stop-all', label: 'Stop all' },
  { value: 'pause', label: 'Pause' },
  { value: 'resume', label: 'Resume' },
  { value: 'toggle-pause', label: 'Toggle pause' },
]

/**
 * Editor for actions that trigger a global control.
 */
export function GlobalControlActionEditor({
  action,
  onChange,
}: ActionEditorProps<GlobalControlAction>) {
  return (
    <Label
      label="Control"
      input={
        <Select
          entries={globalControlEntries}
          value={action.control}
          onChange={control => onChange({ ...action, control })}
        />
      }
    />
  )
}

const sequenceControlEntries: SelectEntry<SequenceControl>[] = [
  { value: 'start', label: 'Start / resume' },
  { value: 'pause', label: 'Pause' },
  { value: 'toggle', label: 'Toggle start / pause' },
  { value: 'stop', label: 'Stop (reset to start)' },
  { value: 'restart', label: 'Restart from the beginning' },
  { value: 'next', label: 'Next step' },
]

/**
 * Editor for actions that control sequences.
 */
export function SequenceActionEditor({
  action,
  onChange,
}: ActionEditorProps<SequenceAction>) {
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const sequenceIds = useShallowEqualMemo(masterData.sequences.map(it => it.id))
  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.sequences.get(id)?.name ?? id,
    [masterDataMaps]
  )

  return (
    <TwoColumDialogContainer
      left={
        <MultiToggleInput
          value={action.ids ?? []}
          entries={sequenceIds}
          onChange={ids => onChange({ ...action, ids })}
          getDisplayValue={getDisplayValue}
        />
      }
      right={
        <Label
          label="Control"
          input={
            <Select
              entries={sequenceControlEntries}
              value={action.control}
              onChange={control => onChange({ ...action, control })}
            />
          }
        />
      }
      fullWidth
      preferSingleRow
    />
  )
}

const buttonDownEntries: SelectEntry<boolean>[] = [
  { value: true, label: 'Press' },
  { value: false, label: 'Release' },
]

/**
 * Editor for actions that press or release programmable buttons.
 */
export function ButtonActionEditor({
  action,
  onChange,
}: ActionEditorProps<ButtonAction>) {
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const buttonIds = useShallowEqualMemo(masterData.buttons.map(it => it.id))
  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.buttons.get(id)?.label ?? id,
    [masterDataMaps]
  )

  return (
    <TwoColumDialogContainer
      left={
        <MultiToggleInput
          value={action.ids ?? []}
          entries={buttonIds}
          onChange={ids => onChange({ ...action, ids })}
          getDisplayValue={getDisplayValue}
        />
      }
      right={
        <Label
          label="Control"
          input={
            <Select
              entries={buttonDownEntries}
              value={!!action.down}
              onChange={down => onChange({ ...action, down })}
            />
          }
        />
      }
      fullWidth
      preferSingleRow
    />
  )
}

/**
 * Editor for actions that trigger named actions.
 */
export function NamedActionsActionEditor({
  action,
  onChange,
}: ActionEditorProps<NamedActionsAction>) {
  const hasNamedActions = useApiState('masterData').actions.length > 0

  if (!hasNamedActions) {
    return (
      <div className={emptyHint}>
        No named actions yet. Add them on the config page, or convert inline
        actions.
      </div>
    )
  }

  return (
    <ArrayInput
      value={action.ids ?? []}
      onChange={ids => onChange({ ...action, ids })}
      renderInput={inputProps => (
        <EntityReferenceSelect
          entity="actions"
          addUndefinedOption
          {...inputProps}
        />
      )}
      displayRemoveButtons
      sortable
    />
  )
}
