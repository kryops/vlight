import { css } from '@linaria/core'
import { Memory, MemoryState } from '@vlight/types'

import { setMemoryState } from '../../api'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { iconConfig, iconLight } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

const container = css`
  display: flex;
  align-items: flex-start;
  gap: ${baseline(4)};
  justify-content: center;
`

const fader = css`
  margin: 0 ${baseline(2)};
`

export interface StatelessMemoryWidgetProps {
  memory: Memory
  state: MemoryState
}

export const StatelessMemoryWidget = memoInProduction(
  ({ memory, state }: StatelessMemoryWidgetProps) => {
    return (
      <Widget
        key={memory.id}
        title={memory.name ?? memory.id}
        titleSide={
          <Icon
            icon={iconConfig}
            onClick={() => openEntityEditorForId('memories', memory.id)}
            shade={1}
            hoverable
            inline
          />
        }
        onTitleClick={() =>
          setMemoryState(
            memory.id,
            {
              on: !state.on,
            },
            true
          )
        }
        turnedOn={state.on}
      >
        <div className={container}>
          <div className={faderContainer}>
            <Fader
              className={fader}
              max={255}
              step={1}
              value={state.value ?? 0}
              onChange={value =>
                setMemoryState(
                  memory.id,
                  {
                    value,
                  },
                  true
                )
              }
            />
          </div>
          <Button
            icon={iconLight}
            onDown={() =>
              setMemoryState(
                memory.id,
                {
                  on: true,
                },
                true
              )
            }
            onUp={() => setMemoryState(memory.id, { on: false }, true)}
          />
        </div>
      </Widget>
    )
  }
)
