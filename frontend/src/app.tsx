import React from 'react'
import { hot } from 'react-hot-loader/root'

import { sendApiMessage } from './api'
import { ApiWrapper } from './api/api-wrapper'
import { ChannelUniverseContext, DmxUniverseContext } from './context'

const App: React.SFC = () => (
  <ApiWrapper>
    <div>
      Hello :-)
      <DmxUniverseContext.Consumer>
        {universe =>
          universe && <div>DMX: {JSON.stringify(universe!.slice(0, 50))}</div>
        }
      </DmxUniverseContext.Consumer>
      <ChannelUniverseContext.Consumer>
        {universe =>
          universe && (
            <div>Channels: {JSON.stringify(universe!.slice(0, 50))}</div>
          )
        }
      </ChannelUniverseContext.Consumer>
    </div>
    <div>
      Channel 1:
      <input
        type="number"
        defaultValue={'0'}
        onChange={e =>
          sendApiMessage({ type: 'channels', channels: { 1: +e.target.value } })
        }
      />
    </div>
  </ApiWrapper>
)

export default hot(App)
