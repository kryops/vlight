import React, { Suspense } from 'react'
import { hot } from 'react-hot-loader/root'

import {
  ChannelUniverseContext,
  DmxUniverseContext,
  sendApiMessage,
} from './api'
import { ApiWrapper } from './api/api-wrapper'
import styles from './app.scss'
import { ErrorBoundary } from './util/error-boundary'

const { foo } = styles

const LazyLoader = React.lazy(() => import('./experiment/lazy/lazy'))

const App: React.SFC = () => (
  <ErrorBoundary>
    <ApiWrapper>
      <Suspense fallback={false}>
        <div>
          Hello :-)
          <DmxUniverseContext.Consumer>
            {universe =>
              universe && (
                <div>DMX: {JSON.stringify(universe!.slice(0, 50))}</div>
              )
            }
          </DmxUniverseContext.Consumer>
          <ChannelUniverseContext.Consumer>
            {universe =>
              universe && (
                <>
                  <div>Channels: {JSON.stringify(universe!.slice(0, 50))}</div>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div className={foo} key={i}>
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

        <LazyLoader />
      </Suspense>
    </ApiWrapper>
  </ErrorBoundary>
)

export default hot(App)
