import { css } from 'linaria'
import React from 'react'

import { setChannel } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { createRangeArray } from '../../util/array'
import { getUniverseIndex } from '../../api/util'

const faderContainer = css`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: ${baselinePx * 8}px; // horizontal scrolling

  // justify-content: center does not work with overflow
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`

interface StatelessProps {
  channels: number[]
  from: number
  to: number
  title?: string
}

const _StatelessChannelsWidget: React.SFC<StatelessProps> = ({
  channels,
  from,
  to,
  title,
}) => {
  const range = createRangeArray(from, to)

  return (
    <Widget title={title || `Channels ${from} - ${to}`}>
      <div className={faderContainer}>
        {range.map(channel => (
          <Fader
            key={channel}
            max={255}
            step={1}
            label={channel.toString()}
            value={channels[getUniverseIndex(channel)] || 0}
            onChange={value => setChannel(channel, value)}
          />
        ))}
      </div>
    </Widget>
  )
}

export const StatelessChannelsWidget = memoInProduction(
  _StatelessChannelsWidget
)
