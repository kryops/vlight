import { Memory, MemoryState } from '@vlight/entities'
import React from 'react'

import { changeMemoryState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { memoInProduction } from '../../util/development'
import { widgetTitle, widgetTurnedOff } from '../../ui/css/widget'

export interface StatelessMemoryWidgetProps {
  memory: Memory
  state: MemoryState
}

export const StatelessMemoryWidget = memoInProduction(
  ({ memory, state }: StatelessMemoryWidgetProps) => {
    return (
      <Widget
        key={memory.id}
        title={
          <div className={widgetTitle}>
            <a
              onClick={() =>
                changeMemoryState(memory.id, {
                  value: state.value,
                  on: !state.on,
                })
              }
            >
              {memory.name ?? memory.id} {!state.on && '[OFF]'}
            </a>
          </div>
        }
        className={state.on ? undefined : widgetTurnedOff}
      >
        <div className={faderContainer}>
          <Fader
            max={255}
            step={1}
            value={state.value ?? 0}
            onChange={value =>
              changeMemoryState(memory.id, {
                on: state.on,
                value,
              })
            }
          />
        </div>
      </Widget>
    )
  }
)
