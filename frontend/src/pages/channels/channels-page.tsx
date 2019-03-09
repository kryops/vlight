import { css } from 'linaria'
import React, { memo, useContext } from 'react'

import { setChannel } from '../../api'
import { AppStateContext } from '../../api/context'
import { getUniverseIndex } from '../../api/util'
import { Fader } from '../../ui/controls/fader'
import { baselinePx } from '../../ui/styles'
import { createRangeArray } from '../../util/array'

const channelsPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-right: ${baselinePx * 8}px; // to allow scrolling

  &::after {
    content: '';
    flex: auto;
  }
`

const _ChannelsPage: React.SFC = () => {
  const { channels } = useContext(AppStateContext)

  // TODO add paging / virtual scrolling?
  const allChannels = createRangeArray(1, 512)

  return (
    <div className={channelsPage}>
      {allChannels.map(i => (
        <Fader
          key={i}
          value={channels![getUniverseIndex(i)] || 0}
          max={255}
          step={1}
          label={i.toString()}
          onChange={value => setChannel(i, value)}
        />
      ))}
    </div>
  )
}

export default memo(_ChannelsPage)
