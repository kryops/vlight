import { Memory, MemoryState } from '@vlight/entities'
import React from 'react'

import { setMemoryState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { memoInProduction } from '../../util/development'

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
        onTitleClick={() =>
          setMemoryState(memory.id, {
            value: state.value,
            on: !state.on,
          })
        }
        turnedOn={state.on}
      >
        <div className={faderContainer}>
          <Fader
            max={255}
            step={1}
            value={state.value ?? 0}
            onChange={value =>
              setMemoryState(memory.id, {
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
