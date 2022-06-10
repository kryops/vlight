import { IdType, LiveMemory } from '@vlight/types'
import { css } from '@linaria/core'

import { deleteLiveMemory, setLiveMemoryState } from '../../api'
import { MemorySceneEditor } from '../../pages/config/entities/editors/memory-scene-editor'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { flexWrap } from '../../ui/css/flex'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { Button } from '../../ui/buttons/button'
import { iconDelete } from '../../ui/icons'
import { showDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'

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

const preview = css`
  min-width: ${baseline(40)};
  width: ${baseline(40)};
  margin: 0;
`

export interface StatelessLiveMemoryWidgetProps {
  id: IdType
  state: LiveMemory
  title?: string
}

export const StatelessLiveMemoryWidget = memoInProduction(
  ({ id, state, title }: StatelessLiveMemoryWidgetProps) => {
    return (
      <Widget
        title={title}
        onTitleClick={() => setLiveMemoryState(id, { on: !state.on }, true)}
        turnedOn={state.on}
        contentClassName={flexWrap}
        titleSide={
          <div className={controls}>
            <Button
              icon={iconDelete}
              title="Delete"
              transparent
              onDown={async () => {
                if (await showDialog('Delete Live Memory?', yesNo)) {
                  deleteLiveMemory(id)
                }
              }}
            />
          </div>
        }
      >
        <div className={leftColumn}>
          <MemorySceneEditor
            scene={state}
            onChange={newState => setLiveMemoryState(id, newState, true)}
            compact
          />
        </div>
        <div className={cx(flexWrap, rightColumn)}>
          <Fader
            className={fader}
            max={255}
            step={1}
            value={state.value ?? 0}
            onChange={value => setLiveMemoryState(id, { value }, true)}
          />
          <MemoryPreview className={preview} scenes={[state]} />
        </div>
      </Widget>
    )
  }
)
