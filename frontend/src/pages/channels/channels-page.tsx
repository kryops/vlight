import { css } from '@linaria/core'
import { createRangeArray } from '@vlight/utils'

import { setChannel } from '../../api'
import { getUniverseIndex } from '../../api/util'
import { useApiState } from '../../hooks/api'
import { ChannelFader } from '../../ui/controls/fader/channel-fader'
import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { Header } from '../../ui/containers/header'

import { ChannelsActions } from './channels-actions'

const channelsPage = css`
  justify-content: space-between;
`

// TODO add paging / virtual scrolling?
const allChannels = createRangeArray(1, 512)

/**
 * Channels page.
 *
 * Displays faders for all DMX channels.
 */
const ChannelsPage = memoInProduction(() => {
  const channels = useApiState('channels')

  return (
    <>
      <Header rightContent={<ChannelsActions />}>Channels</Header>
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
    </>
  )
})

export default ChannelsPage
