import { IdType, LiveMemory, MemoryScene } from '@vlight/types'
import { css } from '@linaria/core'
import { useMemo } from 'react'
import { defaultLiveMemoryGradientSpeed } from '@vlight/controls'

import { deleteLiveMemory, setLiveMemoryState } from '../../api'
import { MemorySceneEditor } from '../../pages/config/entities/editors/memory-scene-editor'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { flexWrap } from '../../ui/css/flex'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { Button } from '../../ui/buttons/button'
import {
  iconConfig,
  iconDelete,
  iconList,
  iconLiveMemory,
} from '../../ui/icons'
import {
  showDialog,
  showDialogWithReturnValue,
  showPromptDialog,
} from '../../ui/overlays/dialog'
import { buttonCancel, buttonOk, yesNo } from '../../ui/overlays/buttons'
import { useDeepEqualMemo } from '../../hooks/performance'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { Checkbox } from '../../ui/forms/checkbox'
import { widgetTitleControls } from '../../ui/css/widget-controls'
import { StartStopButton } from '../start-stop-button'

import { MemoryPreview } from './memory-preview'
import { removeReferencesFromButtons } from '../../pages/config/entities/button-references'

const leftColumn = css`
  flex: 1 1 auto;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};

  > * {
    margin-bottom: ${baseline(2)};
  }
`

const rightColumn = css`
  align-items: flex-start;
`

const fader = css`
  margin: 0 ${baseline(2)};
`

export interface EditLiveMemoryArgs {
  name?: string
  members?: string[]
}

export interface EditLiveMemoryResult {
  name: string
  members: string[]
}

export async function editLiveMemory(
  args?: EditLiveMemoryArgs
): Promise<EditLiveMemoryResult | null> {
  let members: string[] = args?.members ?? []

  const name = await showPromptDialog({
    title: args ? 'Edit Live Memory' : 'Add Live Memory',
    label: 'Name',
    initialValue: args?.name,
    additionalContent: (
      <>
        <br />
        <FixtureListEditor
          value={members}
          onChange={newValue => (members = newValue)}
          ordering
          compact
        />
      </>
    ),
  })

  return name !== undefined ? { name, members } : null
}

export interface StatelessLiveMemoryWidgetProps extends WidgetPassthrough {
  id: IdType
  state: LiveMemory
  title?: string

  /**
   * If set, state changes are passed to this callback instead of being sent
   * to the backend (e.g. to edit actions).
   *
   * Controls that cannot be expressed as state changes (e.g. delete) are hidden,
   * and the edit button only edits the members.
   */
  onChange?: (newState: Partial<LiveMemory>) => void
}

/**
 * Stateless widget to display a live memory.
 */
export const StatelessLiveMemoryWidget = ({
  id,
  state,
  title,
  onChange,
  ...passThrough
}: StatelessLiveMemoryWidgetProps) => {
  const update =
    onChange ??
    ((newState: Partial<LiveMemory>) => setLiveMemoryState(id, newState, true))

  const {
    on: _on,
    value: _value,
    gradientSpeed = defaultLiveMemoryGradientSpeed,
    gradientMovement,
    gradientMovementInverted,
    gradientIgnoreFixtureOffset,
    ...rawScene
  } = state
  const scene = useDeepEqualMemo(rawScene)
  const scenes = useMemo(() => [scene], [scene])

  const hasGradient = scene.states.some(state => Array.isArray(state))

  const changeScene = (newState: MemoryScene) => update(newState)

  const changeValue = (value: number) => update({ value })

  const changeGradientSpeed = (newSpeed: number) =>
    update({ gradientSpeed: newSpeed })

  const toggleOn = () => update({ on: !state.on })

  const toggleMovement = () =>
    update({
      gradientMovement: !state.gradientMovement,
      on: state.on || !state.gradientMovement,
    })

  const startMovement = () => update({ gradientMovement: true, on: true })

  const toggleInverted = () =>
    update({ gradientMovementInverted: !state.gradientMovementInverted })

  const toggleIgnoreOffset = () =>
    update({ gradientIgnoreFixtureOffset: !state.gradientIgnoreFixtureOffset })

  const edit = async () => {
    if (onChange) {
      const members = await showDialogWithReturnValue<string[]>(
        onMembersChange => (
          <FixtureListEditor
            value={scene.members}
            onChange={onMembersChange}
            ordering
          />
        ),
        [buttonOk, buttonCancel],
        { title: 'Members', showCloseButton: true }
      )
      if (members) update({ members })
      return
    }

    const result = await editLiveMemory({
      name: state.name,
      members: scene.members,
    })
    if (result) update(result)
  }

  const promptDelete = async () => {
    if (await showDialog(`Delete Live Memory "${title}"?`, yesNo)) {
      deleteLiveMemory(id)
      removeReferencesFromButtons('live-memory', id)
    }
  }

  const showPreview = () => {
    void showDialog(<MemoryPreview scenes={scenes} />, undefined, {
      showCloseButton: true,
      closeOnBackDrop: true,
      title: `Live Memory ${state.name}`,
    })
  }

  return (
    <Widget
      icon={iconLiveMemory}
      title={title}
      onTitleClick={toggleOn}
      turnedOn={state.on}
      contentClassName={flexWrap}
      {...passThrough}
      titleSide={
        <div className={widgetTitleControls}>
          <Button
            icon={onChange ? iconList : iconConfig}
            title={onChange ? 'Members' : 'Edit'}
            transparent
            onClick={edit}
          />
          {!onChange && (
            <Button
              icon={iconDelete}
              title="Delete"
              transparent
              onClick={promptDelete}
            />
          )}
          {hasGradient && (
            <StartStopButton
              started={!!gradientMovement}
              on={state.on}
              onToggle={toggleMovement}
              onStart={startMovement}
              startTitle="Start movement"
              stopTitle="Stop movement"
              hotkey="m"
              ignorePause={!!onChange}
            />
          )}
        </div>
      }
    >
      <div className={leftColumn}>
        <MemorySceneEditor
          scene={scene}
          onChange={changeScene}
          hideFixtureList
          compact
        />
        <Button block onClick={showPreview}>
          Preview
        </Button>

        {hasGradient && (
          <>
            <a
              onClick={toggleInverted}
              title="Changes the direction of gradient movement"
            >
              <Checkbox
                value={gradientMovementInverted ?? false}
                onChange={toggleInverted}
                inline
              />
              Move inverted
            </a>
            <br />
            <a
              onClick={toggleIgnoreOffset}
              title="Applies the same gradient offset to all members"
            >
              <Checkbox
                value={gradientIgnoreFixtureOffset ?? false}
                onChange={toggleIgnoreOffset}
                inline
              />
              Same offset
            </a>
          </>
        )}
      </div>
      <div className={cx(flexWrap, rightColumn)}>
        <Fader
          className={fader}
          max={255}
          step={1}
          value={state.value ?? 0}
          onChange={changeValue}
        />
        {hasGradient && (
          <Fader
            className={fader}
            max={0.25}
            min={200}
            quadraticScale={1 / 5}
            value={gradientSpeed}
            onChange={changeGradientSpeed}
            label="Move"
            subLabel={`${gradientSpeed.toFixed(2)}s`}
          />
        )}
      </div>
    </Widget>
  )
}
