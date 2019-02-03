import React from 'react'
import { hot } from 'react-hot-loader/root'
import { BrowserRouter } from 'react-router-dom'

import { ApiWrapper } from './api/api-wrapper'
import './global.scss'
import { MainContainer } from './ui/main/main-container'
import { ErrorBoundary } from './util/error-boundary'

const App: React.SFC = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <ApiWrapper>
        <MainContainer />
      </ApiWrapper>
    </BrowserRouter>
  </ErrorBoundary>
)

export default hot(App)
