import { createRangeArray } from '@vlight/utils'

import { setChannel } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { ChannelFader } from '../../ui/controls/fader/channel-fader'
import { faderContainer } from '../../ui/css/fader-container'
import { memoInProduction } from '../../util/development'
import { getUniverseIndex } from '../../api/util'
import { iconFader } from '../../ui/icons'

export interface StatelessChannelsWidgetProps {
  channels: number[]
  from: number
  to: number
  title?: string
}

/**
 * Stateless widget to display DMX channel faders.
 */
export const StatelessChannelsWidget = memoInProduction(
  ({ channels, from, to, title }: StatelessChannelsWidgetProps) => {
    const range = createRangeArray(from, to)

    return (
      <Widget icon={iconFader} title={title ?? `Channels ${from} - ${to}`}>
        <div className={faderContainer}>
          {range.map(channel => (
            <ChannelFader
              key={channel}
              channel={channel}
              value={channels[getUniverseIndex(channel)] ?? 0}
              onChange={setChannel}
            />
          ))}
        </div>
      </Widget>
    )
  }
)
