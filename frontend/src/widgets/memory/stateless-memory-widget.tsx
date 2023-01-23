import { css } from '@linaria/core'
import { Memory, MemoryState } from '@vlight/types'

import { setMemoryState } from '../../api'
import { useEvent } from '../../hooks/performance'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
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

export interface StatelessMemoryWidgetProps extends WidgetPassthrough {
  memory: Memory
  state: MemoryState
}

/**
 * Stateless widget to display a memory.
 */
export const StatelessMemoryWidget = memoInProduction(
  ({ memory, state, ...passThrough }: StatelessMemoryWidgetProps) => {
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

    const toggleOn = useEvent(() =>
      setMemoryState(
        memory.id,
        {
          on: !state.on,
        },
        true
      )
    )

    const instantOn = useEvent(() =>
      setMemoryState(
        memory.id,
        {
          on: true,
        },
        true
      )
    )

    const instantOff = () => setMemoryState(memory.id, { on: false }, true)

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
        onTitleClick={toggleOn}
        turnedOn={state.on}
        {...passThrough}
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
            onDown={instantOn}
            onUp={instantOff}
            title="Instant on/off"
            hotkey="m"
          />
        </div>
      </Widget>
    )
  }
)
