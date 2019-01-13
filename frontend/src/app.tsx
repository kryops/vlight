import React, { Suspense } from 'react'
import { hot } from 'react-hot-loader/root'

import { sendApiMessage } from './api'
import { ApiWrapper } from './api/api-wrapper'
import styles from './app.scss'
import { ChannelUniverseContext, DmxUniverseContext } from './context'

const { foo } = styles

const LazyLoader = React.lazy(() => import('./lazy/lazy'))

const App: React.SFC = () => (
  <ApiWrapper>
    <Suspense fallback={false}>
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
      <div className={foo}>
        Channel 1:
        <input
          type="number"
          defaultValue={'0'}
          onChange={e =>
            sendApiMessage({
              type: 'channels',
              channels: { 1: +e.target.value },
            })
          }
        />
      </div>
      <LazyLoader />
    </Suspense>
  </ApiWrapper>
)

export default hot(App)
