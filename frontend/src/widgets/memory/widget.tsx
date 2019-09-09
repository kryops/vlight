import { Memory, MemoryState } from '@vlight/entities'
import { css } from 'linaria'
import React from 'react'

import { changeMemoryState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

const title = css`
  display: flex;

  & > :first-child {
    flex-grow: 1;
  }
`

const turnedOff = css`
  & > * {
    opacity: 0.75;
  }
`

const faderContainer = css`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  max-width: 100%;
  /* horizontal scrolling */
  padding-bottom: ${baselinePx * 8}px;

  /* justify-content: center does not work with overflow */
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`

interface StatelessProps {
  memory: Memory
  state: MemoryState
}

const _StatelessMemoryWidget: React.SFC<StatelessProps> = ({
  memory,
  state,
}) => {
  return (
    <Widget
      key={memory.id}
      title={
        <div className={title}>
          <a
            onClick={() =>
              changeMemoryState(memory.id, {
                value: state.value,
                on: !state.on,
              })
            }
          >
            {memory.name || memory.id} {!state.on && '[OFF]'}
          </a>
        </div>
      }
      className={state.on ? undefined : turnedOff}
    >
      <div className={faderContainer}>
        <Fader
          max={255}
          step={1}
          value={state.value || 0}
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

export const StatelessMemoryWidget = memoInProduction(_StatelessMemoryWidget)
