import React from 'react'
import { hot } from 'react-hot-loader/root'

import { ApiWrapper } from './api-wrapper'
import { UniverseContext } from './context'

const App: React.SFC = () => (
  <ApiWrapper>
    <div>
      Hello :-)
      <UniverseContext.Consumer>
        {universe => universe && JSON.stringify(universe!.slice(0, 50))}
      </UniverseContext.Consumer>
    </div>
  </ApiWrapper>
)

export default hot(App)
