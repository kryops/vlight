import React, { memo } from 'react'

import {
  ChannelUniverseContext,
  DmxUniverseContext,
  sendApiMessage,
} from '../../api'
import { Fader } from '../../ui/controls/fader'

const _ChannelsPage: React.SFC = () => (
  <div>
    <DmxUniverseContext.Consumer>
      {universe =>
        universe && <div>DMX: {JSON.stringify(universe!.slice(0, 50))}</div>
      }
    </DmxUniverseContext.Consumer>
    <ChannelUniverseContext.Consumer>
      {channels =>
        channels && (
          <>
            <div>Channels: {JSON.stringify(channels!.slice(0, 50))}</div>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Fader
                  key={i}
                  value={channels![i - 1]}
                  max={255}
                  step={1}
                  onChange={val => {
                    if (val === channels![i - 1]) {
                      return
                    }
                    sendApiMessage({
                      type: 'channels',
                      channels: { [i]: val },
                    })
                  }}
                />
              ))}
            </div>
          </>
        )
      }
    </ChannelUniverseContext.Consumer>
  </div>
)

export default memo(_ChannelsPage)
