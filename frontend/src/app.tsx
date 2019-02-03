import React from 'react'
import { hot } from 'react-hot-loader/root'

import { ApiWrapper } from './api/api-wrapper'
import './global.scss'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'
import { RouterWithContext } from './util/router-with-context'

const App: React.SFC = () => (
  <ErrorBoundary>
    <RouterWithContext>
      <ApiWrapper>
        <MainContainer />
      </ApiWrapper>
    </RouterWithContext>
  </ErrorBoundary>
)

export default hot(App)
