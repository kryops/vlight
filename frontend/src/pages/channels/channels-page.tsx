import { css } from 'linaria'
import React from 'react'

import { setChannel } from '../../api'
import { getUniverseIndex } from '../../api/util'
import { useApiState } from '../../hooks/api'
import { ChannelFader } from '../../ui/controls/fader/channel-fader'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { createRangeArray } from '../../util/array'
import { memoInProduction } from '../../util/development'

const channelsPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  /* to allow scrolling */
  margin-right: ${baselinePx * 8}px;

  ${flexEndSpacer}
`

const ChannelsPage = memoInProduction(() => {
  const channels = useApiState('channels')

  // TODO add paging / virtual scrolling?
  const allChannels = createRangeArray(1, 512)

  return (
    <div className={channelsPage}>
      {allChannels.map(channel => (
        <ChannelFader
          key={channel}
          channel={channel}
          value={channels![getUniverseIndex(channel)] || 0}
          onChange={setChannel}
        />
      ))}
    </div>
  )
})

export default ChannelsPage
