import { hot } from 'react-hot-loader/root'
import React, { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ApiWrapper } from './api/api-wrapper'
import './ui/global-styles'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'
import { SettingsWrapper } from './settings'
import { OverlayContainer } from './ui/overlays/overlay'

const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsWrapper>
          <ApiWrapper>
            <OverlayContainer>
              <MainContainer />
            </OverlayContainer>
          </ApiWrapper>
        </SettingsWrapper>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)

export default hot(App)
