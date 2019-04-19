import React, { StrictMode } from 'react'
import { hot } from 'react-hot-loader/root'

import { ApiWrapper } from './api/api-wrapper'
import './ui/global-styles'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'
import { RouterWithContext } from './util/router-with-context'

const App: React.SFC = () => (
  <StrictMode>
    <ErrorBoundary>
      <RouterWithContext>
        <ApiWrapper>
          <MainContainer />
        </ApiWrapper>
      </RouterWithContext>
    </ErrorBoundary>
  </StrictMode>
)

export default hot(App)
