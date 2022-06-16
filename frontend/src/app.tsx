import './ui/global-styles'

import { BrowserRouter } from 'react-router-dom'

import { ApiWrapper } from './api/api-wrapper'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'
import { SettingsWrapper } from './settings'
import { OverlayContainer } from './ui/overlays/overlay'

// Cannot use strict mode due to https://github.com/atlassian/react-beautiful-dnd/issues/2350
const App = () => (
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
)

export default App
