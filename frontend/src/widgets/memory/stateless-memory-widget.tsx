import { css } from '@linaria/core'
import { Memory, MemoryState } from '@vlight/types'

import { setMemoryState } from '../../api'
import { useEvent } from '../../hooks/performance'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { iconConfig, iconLight, iconMemory, iconOn } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

const outerContainer = css`
  width: 100%;
`

const container = css`
  display: flex;
  align-items: flex-start;
  gap: ${baseline(4)};
  justify-content: center;
`

const fader = css`
  margin: 0 ${baseline(2)};
`

const button = css`
  margin-bottom: ${baseline(4)};
`

const configContainer = css`
  text-align: right;
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

    const display = memory.display ?? 'both'

    return (
      <Widget
        key={memory.id}
        icon={iconMemory}
        title={memory.name ?? memory.id}
        onTitleClick={display === 'flash' ? undefined : toggleOn}
        turnedOn={state.on}
        {...passThrough}
      >
        <div className={outerContainer}>
          <div className={container}>
            {(display === 'fader' || display === 'both') && (
              <div className={faderContainer}>
                <Fader
                  className={fader}
                  max={255}
                  step={1}
                  value={state.value ?? 0}
                  onChange={changeValue}
                />
              </div>
            )}
            {(display === 'flash' || display === 'both') && (
              <Button
                icon={iconLight}
                onDown={instantOn}
                onUp={instantOff}
                title="Instant on/off"
                hotkey="m"
                className={button}
              />
            )}
            {display === 'toggle' && (
              <Button
                icon={iconOn}
                onClick={toggleOn}
                title="Toggle on/off"
                hotkey="m"
                className={button}
              />
            )}
          </div>
          <div className={configContainer}>
            <Icon
              icon={iconConfig}
              onClick={openEditor}
              shade={1}
              hoverable
              inline
            />
          </div>
        </div>
      </Widget>
    )
  }
)
