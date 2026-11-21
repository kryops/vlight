import { css } from '@linaria/core'
import {
  defaultLiveMovementCenter,
  liveMovementChannels,
} from '@vlight/controls'
import {
  FixtureOrder,
  IdType,
  LiveMovement,
  LiveMovementInvert,
  LiveMovementPattern,
  LiveMovementPosition,
} from '@vlight/types'

import {
  deleteLiveMovement,
  resetLiveMovement,
  setLiveMovementState,
} from '../../api'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { widgetTitleControls } from '../../ui/css/widget-controls'
import { StartStopButton } from '../start-stop-button'
import { centeredText } from '../../ui/css/basic-styles'
import { faderContainer } from '../../ui/css/fader-container'
import { flexAuto, flexWrap } from '../../ui/css/flex'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { Select, SelectEntry } from '../../ui/forms/select'
import { fixtureOrderEntries } from '../../ui/forms/fixture-order-entries'
import {
  iconCenter,
  iconDelete,
  iconList,
  iconMovement,
  iconPositionPicker,
  iconRename,
} from '../../ui/icons'
import { buttonCancel, buttonOk, yesNo } from '../../ui/overlays/buttons'
import {
  showDialog,
  showDialogWithReturnValue,
  showPromptDialog,
} from '../../ui/overlays/dialog'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'

import { LiveMovementPreview } from './live-movement-preview'
import { removeReferencesFromActions } from '../../pages/config/entities/action-references'

/** Fastest speed (duration of a cycle in seconds). */
export const liveMovementMaxSpeed = 0.5
/** Slowest speed (duration of a cycle in seconds). */
export const liveMovementMinSpeed = 60
const liveMovementFaderQuadraticScale = 1 / 4

const previewSize = 36 * 4

const container = css`
  padding-bottom: 0;
`

const settingsColumn = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: ${previewSize}px;
  margin: ${baseline(1.5)};
  flex: 0 0 auto;

  > select {
    flex: 0 0 auto;
    margin-bottom: ${baseline(1)};
  }
`

const patternEntries: SelectEntry<LiveMovementPattern>[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'line', label: 'Line' },
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'eight', label: 'Eight' },
]

const orderEntries: SelectEntry<FixtureOrder>[] = fixtureOrderEntries.map(
  entry => ({ ...entry, label: `Order: ${entry.label}` })
)

const invertEntries: SelectEntry<LiveMovementInvert>[] = [
  { value: 'none', label: 'Invert: None' },
  { value: 'all', label: 'Invert: All' },
  { value: 'half', label: 'Invert: Half' },
  { value: 'alternate', label: 'Invert: Alternating' },
]

export interface EditLiveMovementMembersArgs {
  title: string
  members?: string[]
}

/** Shows a dialog to edit a live movement's members, which may only contain moving heads. */
export function showLiveMovementMembersDialog({
  title,
  members = [],
}: EditLiveMovementMembersArgs): Promise<string[] | undefined> {
  return showDialogWithReturnValue<string[]>(
    onChange => (
      <FixtureListEditor
        value={members}
        onChange={onChange}
        requiredChannels={liveMovementChannels}
        ordering
      />
    ),
    [buttonOk, buttonCancel],
    { title, showCloseButton: true, initialValue: members }
  )
}

export interface StatelessLiveMovementWidgetProps extends WidgetPassthrough {
  id: IdType
  state: LiveMovement
  title?: string

  /**
   * If set, state changes are passed to this callback instead of being sent
   * to the backend (e.g. to edit actions).
   *
   * Controls that cannot be expressed as state changes (e.g. return to center, delete)
   * are hidden.
   */
  onChange?: (newState: Partial<LiveMovement>) => void
}

/**
 * Stateless widget to display a live movement.
 */
export const StatelessLiveMovementWidget = ({
  id,
  state,
  title,
  onChange,
  ...passThrough
}: StatelessLiveMovementWidgetProps) => {
  const update =
    onChange ??
    ((newState: Partial<LiveMovement>) =>
      setLiveMovementState(id, newState, true))

  const onTitleClick = () => update({ on: !state.on })

  const toggleStartStop = () =>
    update({
      stopped: !state.stopped,
      on: state.on || !!state.stopped,
    })

  const start = () => update({ stopped: false, on: true })

  const returnToCenter = () => resetLiveMovement(id)

  const changeCenter = (center: LiveMovementPosition) => update({ center })

  const resetCenter = () => changeCenter(defaultLiveMovementCenter)

  const editMembers = async () => {
    const result = await showLiveMovementMembersDialog({
      title: `Members for ${title ?? 'movement'}`,
      members: state.members,
    })
    if (result) update({ members: result })
  }

  const rename = async () => {
    const name = await showPromptDialog({
      title: 'Rename Movement',
      label: 'Name',
      initialValue: state.name,
    })
    if (name) update({ name })
  }

  const promptDelete = async () => {
    if (await showDialog(`Delete Movement "${title}"?`, yesNo)) {
      deleteLiveMovement(id)
      removeReferencesFromActions('live-movement', id)
    }
  }

  return (
    <Widget
      icon={iconMovement}
      title={title}
      onTitleClick={onTitleClick}
      turnedOn={state.on}
      contentClassName={flexWrap}
      titleSide={
        <div className={widgetTitleControls}>
          {!onChange && (
            <Button
              icon={iconCenter}
              title="Return to center"
              transparent
              onDown={returnToCenter}
              hotkey="n"
            />
          )}
          <StartStopButton
            started={!state.stopped}
            on={state.on}
            onToggle={toggleStartStop}
            onStart={start}
            hotkey="m"
            ignorePause={!!onChange}
          />
        </div>
      }
      {...passThrough}
    >
      <div className={flexAuto}>
        <div className={cx(faderContainer, container)}>
          <div className={settingsColumn}>
            <Select
              entries={patternEntries}
              value={state.pattern}
              onChange={pattern => update({ pattern })}
            />
            <Select
              entries={orderEntries}
              value={state.order ?? 'members'}
              onChange={order => update({ order })}
            />
            <Select
              entries={invertEntries}
              value={state.invert ?? 'none'}
              onChange={invert => update({ invert })}
            />
            <LiveMovementPreview
              movement={state}
              size={previewSize}
              onCenterChange={changeCenter}
              title={`Center: ${state.center.pan} / ${state.center.tilt} (touch to change)`}
            />
          </div>

          <Fader
            max={255}
            step={1}
            value={state.scaleX}
            onChange={scaleX => update({ scaleX })}
            label="Scale X"
          />
          <Fader
            max={255}
            step={1}
            value={state.scaleY}
            onChange={scaleY => update({ scaleY })}
            label="Scale Y"
          />
          <Fader
            max={180}
            step={1}
            value={state.rotation}
            onChange={rotation => update({ rotation })}
            label="Rotate"
            subLabel={`${state.rotation}°`}
          />
          <Fader
            max={90}
            step={1}
            value={state.rotationOffset ?? 0}
            onChange={rotationOffset => update({ rotationOffset })}
            label="Rot. Offset"
            subLabel={`${state.rotationOffset ?? 0}°`}
          />
          <Fader
            max={50}
            step={1}
            value={state.offset * 100}
            onChange={offset => update({ offset: offset / 100 })}
            label="Time Offset"
            subLabel={`${Math.round(state.offset * 100)}%`}
          />
          <Fader
            min={liveMovementMinSpeed}
            max={liveMovementMaxSpeed}
            quadraticScale={liveMovementFaderQuadraticScale}
            value={state.speed}
            onChange={speed => update({ speed })}
            label="Speed"
            subLabel={`${state.speed.toFixed(2)}s`}
          />
        </div>

        <div className={centeredText}>
          <Button
            icon={iconList}
            title="Members"
            transparent
            onClick={editMembers}
          />
          <Button
            icon={iconPositionPicker}
            title={`Reset center to ${defaultLiveMovementCenter.pan} / ${defaultLiveMovementCenter.tilt}`}
            transparent
            onClick={resetCenter}
          />
          {!onChange && (
            <>
              <Button
                icon={iconRename}
                title="Rename"
                transparent
                onClick={rename}
              />
              <Button
                icon={iconDelete}
                title="Delete"
                transparent
                onClick={promptDelete}
              />
            </>
          )}
        </div>
      </div>
    </Widget>
  )
}
