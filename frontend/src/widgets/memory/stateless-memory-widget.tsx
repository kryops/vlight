import { css } from '@linaria/core'
import { Memory, MemoryState } from '@vlight/types'

import { setMemoryState } from '../../api'
import { useEvent } from '../../hooks/performance'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { iconConfig, iconLight, iconMemory } from '../../ui/icons'
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
  hotkeysActive?: boolean
}

/**
 * Stateless widget to display a memory.
 */
export const StatelessMemoryWidget = memoInProduction(
  ({ memory, state, hotkeysActive }: StatelessMemoryWidgetProps) => {
    const changeValue = useEvent((value: number) =>
      setMemoryState(
        memory.id,
        {
          value,
        },
        true
      )
    )

    const openEditor = useEvent(() =>
      openEntityEditorForId('memories', memory.id)
    )

    return (
      <Widget
        key={memory.id}
        icon={iconMemory}
        title={memory.name ?? memory.id}
        titleSide={
          <Icon
            icon={iconConfig}
            onClick={openEditor}
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
        hotkeysActive={hotkeysActive}
      >
        <div className={container}>
          <div className={faderContainer}>
            <Fader
              className={fader}
              max={255}
              step={1}
              value={state.value ?? 0}
              onChange={changeValue}
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
            title="Instant on/off"
            hotkey="m"
          />
        </div>
      </Widget>
    )
  }
)
