import React, { memo } from 'react'

import {
  ChannelUniverseContext,
  DmxUniverseContext,
  sendApiMessage,
} from '../../api'

const _ChannelsPage: React.SFC = () => (
  <div>
    <DmxUniverseContext.Consumer>
      {universe =>
        universe && <div>DMX: {JSON.stringify(universe!.slice(0, 50))}</div>
      }
    </DmxUniverseContext.Consumer>
    <ChannelUniverseContext.Consumer>
      {universe =>
        universe && (
          <>
            <div>Channels: {JSON.stringify(universe!.slice(0, 50))}</div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i}>
                Channel {i}:
                <input
                  type="number"
                  value={universe[i - 1]}
                  onChange={e =>
                    sendApiMessage({
                      type: 'channels',
                      channels: { [i]: +e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </>
        )
      }
    </ChannelUniverseContext.Consumer>
  </div>
)

export default memo(_ChannelsPage)
