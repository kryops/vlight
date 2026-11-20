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
import { iconConfig, iconDelete, iconLiveMemory } from '../../ui/icons'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'
import { useDeepEqualMemo } from '../../hooks/performance'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { Checkbox } from '../../ui/forms/checkbox'
import { widgetTitleControls } from '../../ui/css/widget-controls'
import { StartStopButton } from '../start-stop-button'

import { MemoryPreview } from './memory-preview'

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
}

/**
 * Stateless widget to display a live memory.
 */
export const StatelessLiveMemoryWidget = ({
  id,
  state,
  title,
  ...passThrough
}: StatelessLiveMemoryWidgetProps) => {
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

  const changeScene = (newState: MemoryScene) =>
    setLiveMemoryState(id, newState, true)

  const changeValue = (value: number) => setLiveMemoryState(id, { value }, true)

  const changeGradientSpeed = (newSpeed: number) =>
    setLiveMemoryState(id, { gradientSpeed: newSpeed }, true)

  const toggleOn = () => setLiveMemoryState(id, { on: !state.on }, true)

  const toggleMovement = () =>
    setLiveMemoryState(
      id,
      {
        gradientMovement: !state.gradientMovement,
        on: state.on || !state.gradientMovement,
      },
      true
    )

  const startMovement = () =>
    setLiveMemoryState(id, { gradientMovement: true, on: true }, true)

  const toggleInverted = () =>
    setLiveMemoryState(
      id,
      { gradientMovementInverted: !state.gradientMovementInverted },
      true
    )

  const toggleIgnoreOffset = () =>
    setLiveMemoryState(
      id,
      { gradientIgnoreFixtureOffset: !state.gradientIgnoreFixtureOffset },
      true
    )

  const edit = async () => {
    const result = await editLiveMemory({
      name: state.name,
      members: scene.members,
    })
    if (result) {
      setLiveMemoryState(id, result, true)
    }
  }

  const promptDelete = async () => {
    if (await showDialog(`Delete Live Memory "${title}"?`, yesNo)) {
      deleteLiveMemory(id)
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
          <Button icon={iconConfig} title="Edit" transparent onClick={edit} />
          <Button
            icon={iconDelete}
            title="Delete"
            transparent
            onClick={promptDelete}
          />
          {hasGradient && (
            <StartStopButton
              started={!!gradientMovement}
              on={state.on}
              onToggle={toggleMovement}
              onStart={startMovement}
              startTitle="Start movement"
              stopTitle="Stop movement"
              hotkey="m"
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
