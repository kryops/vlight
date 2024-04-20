import { IdType, LiveMemory, MemoryScene } from '@vlight/types'
import { css } from '@linaria/core'
import { useMemo } from 'react'
import { defaultLiveMemoryGradientSpeed } from '@vlight/controls'

import { deleteLiveMemory, setLiveMemoryState } from '../../api'
import { MemorySceneEditor } from '../../pages/config/entities/editors/memory-scene-editor'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { flexWrap } from '../../ui/css/flex'
import { baseline, errorShade, successShade } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { Button } from '../../ui/buttons/button'
import {
  iconConfig,
  iconDelete,
  iconLiveMemory,
  iconStart,
  iconStop,
} from '../../ui/icons'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'
import { useDeepEqualMemo, useEvent } from '../../hooks/performance'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { Checkbox } from '../../ui/forms/checkbox'

import { MemoryPreview } from './memory-preview'

const controls = css`
  margin: ${baseline(-1.5)};
`

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

const movementActive = css`
  background: ${successShade(2)};

  &:hover {
    background: ${successShade(2)};
  }
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
export const StatelessLiveMemoryWidget = memoInProduction(
  ({ id, state, title, ...passThrough }: StatelessLiveMemoryWidgetProps) => {
    const {
      on,
      value,
      gradientSpeed = defaultLiveMemoryGradientSpeed,
      gradientMovement,
      gradientMovementInverted,
      gradientIgnoreFixtureOffset,
      ...rawScene
    } = state
    const scene = useDeepEqualMemo(rawScene)
    const scenes = useMemo(() => [scene], [scene])

    const hasGradient = scene.states.some(state => Array.isArray(state))

    const changeScene = useEvent((newState: MemoryScene) =>
      setLiveMemoryState(id, newState, true)
    )

    const changeValue = useEvent((value: number) =>
      setLiveMemoryState(id, { value }, true)
    )

    const changeGradientSpeed = useEvent((newSpeed: number) =>
      setLiveMemoryState(id, { gradientSpeed: newSpeed }, true)
    )

    const toggleOn = useEvent(() =>
      setLiveMemoryState(id, { on: !state.on }, true)
    )

    const toggleMovement = useEvent(() =>
      setLiveMemoryState(
        id,
        {
          gradientMovement: !state.gradientMovement,
          on: state.on || !state.gradientMovement,
        },
        true
      )
    )

    const toggleInverted = useEvent(() =>
      setLiveMemoryState(
        id,
        { gradientMovementInverted: !state.gradientMovementInverted },
        true
      )
    )

    const toggleIgnoreOffset = useEvent(() =>
      setLiveMemoryState(
        id,
        { gradientIgnoreFixtureOffset: !state.gradientIgnoreFixtureOffset },
        true
      )
    )

    const edit = useEvent(async () => {
      const result = await editLiveMemory({
        name: state.name,
        members: scene.members,
      })
      if (result) {
        setLiveMemoryState(id, result, true)
      }
    })

    const promptDelete = useEvent(async () => {
      if (await showDialog(`Delete Live Memory "${title}"?`, yesNo)) {
        deleteLiveMemory(id)
      }
    })

    const showPreview = useEvent(() => {
      showDialog(<MemoryPreview scenes={scenes} />, undefined, {
        showCloseButton: true,
        closeOnBackDrop: true,
        title: `Live Memory ${state.name}`,
      })
    })

    return (
      <Widget
        icon={iconLiveMemory}
        title={title}
        onTitleClick={toggleOn}
        turnedOn={state.on}
        contentClassName={flexWrap}
        {...passThrough}
        titleSide={
          <div className={controls}>
            <Button icon={iconConfig} title="Edit" transparent onClick={edit} />
            <Button
              icon={iconDelete}
              title="Delete"
              transparent
              onClick={promptDelete}
            />
            {hasGradient && (
              <Button
                icon={gradientMovement ? iconStart : iconStop}
                title={gradientMovement ? 'Stop movement' : 'Start movement'}
                iconColor={gradientMovement ? successShade(0) : errorShade(0)}
                transparent
                className={gradientMovement ? movementActive : undefined}
                onDown={toggleMovement}
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
)
