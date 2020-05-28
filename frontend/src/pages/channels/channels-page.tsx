import React from 'react'
import { css } from 'linaria'

import { setChannel } from '../../api'
import { getUniverseIndex } from '../../api/util'
import { useApiState } from '../../hooks/api'
import { ChannelFader } from '../../ui/controls/fader/channel-fader'
import { pageWithWidgets } from '../../ui/css/page'
import { createRangeArray } from '../../util/shared'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

const channelsPage = css`
  justify-content: space-between;
`

const ChannelsPage = memoInProduction(() => {
  const channels = useApiState('channels')

  // TODO add paging / virtual scrolling?
  const allChannels = createRangeArray(1, 512)

  return (
    <div className={cx(pageWithWidgets, channelsPage)}>
      {allChannels.map(channel => (
        <ChannelFader
          key={channel}
          channel={channel}
          value={channels![getUniverseIndex(channel)] ?? 0}
          onChange={setChannel}
        />
      ))}
    </div>
  )
})

export default ChannelsPage
