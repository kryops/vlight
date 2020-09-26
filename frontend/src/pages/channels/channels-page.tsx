import React from 'react'
import { css } from 'linaria'

import { setChannel, setChannels } from '../../api'
import { getUniverseIndex } from '../../api/util'
import { useApiState } from '../../hooks/api'
import { ChannelFader } from '../../ui/controls/fader/channel-fader'
import { pageWithWidgets } from '../../ui/css/page'
import { createRangeArray } from '../../util/shared'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { Header } from '../../ui/containers/header'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'

const channelsPage = css`
  justify-content: space-between;
`

// TODO add paging / virtual scrolling?
const allChannels = createRangeArray(1, 512)

const ChannelsPage = memoInProduction(() => {
  const channels = useApiState('channels')

  return (
    <>
      <Header
        rightContent={
          <>
            <Button
              icon={iconLight}
              onDown={() => setChannels(allChannels, 255)}
            >
              ON
            </Button>
            <Button
              icon={iconLightOff}
              onDown={() => setChannels(allChannels, 0)}
            >
              OFF
            </Button>
          </>
        }
      >
        Channels
      </Header>
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
