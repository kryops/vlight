import { hot } from 'react-hot-loader/root'
import React, { StrictMode } from 'react'

import { ApiWrapper } from './api/api-wrapper'
import './ui/global-styles'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'
import { RouterWithContext } from './util/router-with-context'
import { SettingsWrapper } from './settings'

const App: React.SFC = () => (
  <StrictMode>
    <ErrorBoundary>
      <RouterWithContext>
        <SettingsWrapper>
          <ApiWrapper>
            <MainContainer />
          </ApiWrapper>
        </SettingsWrapper>
      </RouterWithContext>
    </ErrorBoundary>
  </StrictMode>
)

export default hot(App)
