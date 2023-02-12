import { IdType, LiveMemory, MemoryScene } from '@vlight/types'
import { css } from '@linaria/core'
import { useMemo } from 'react'

import { deleteLiveMemory, setLiveMemoryState } from '../../api'
import { MemorySceneEditor } from '../../pages/config/entities/editors/memory-scene-editor'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { flexWrap } from '../../ui/css/flex'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { Button } from '../../ui/buttons/button'
import { iconConfig, iconDelete, iconLiveMemory } from '../../ui/icons'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'
import { useDeepEqualMemo, useEvent } from '../../hooks/performance'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'

import { MemoryPreview } from './memory-preview'

const controls = css`
  margin: ${baseline(-1.5)};
`

const leftColumn = css`
  flex: 1 1 auto;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const rightColumn = css`
  align-items: flex-start;

  @media (min-width: 900px) {
    display: block;
    text-align: center;
  }
`

const fader = css`
  margin: 0 ${baseline(2)};
`

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
    const { on, value, ...rawScene } = state
    const scene = useDeepEqualMemo(rawScene)
    const scenes = useMemo(() => [scene], [scene])

    const changeScene = useEvent((newState: MemoryScene) =>
      setLiveMemoryState(id, newState, true)
    )

    const changeValue = useEvent((value: number) =>
      setLiveMemoryState(id, { value }, true)
    )

    const toggleOn = useEvent(() =>
      setLiveMemoryState(id, { on: !state.on }, true)
    )

    const edit = useEvent(async () => {
      let members: string[] = []

      const name = await showPromptDialog({
        title: 'Edit Live Memory',
        label: 'Name',
        initialValue: state.name,
        additionalContent: (
          <>
            <br />
            <FixtureListEditor
              value={scene.members}
              onChange={newValue => (members = newValue)}
              ordering
            />
          </>
        ),
      })
      if (name) {
        setLiveMemoryState(id, { name, members }, true)
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
          </div>
        }
      >
        <div className={leftColumn}>
          <MemorySceneEditor
            scene={scene}
            onChange={changeScene}
            compact
            hideFixtureList
          />
          <Button block onClick={showPreview}>
            Preview
          </Button>
        </div>
        <div className={cx(flexWrap, rightColumn)}>
          <Fader
            className={fader}
            max={255}
            step={1}
            value={state.value ?? 0}
            onChange={changeValue}
          />
        </div>
      </Widget>
    )
  }
)
