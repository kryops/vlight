import React from 'react'
import { render } from 'react-dom'

import App from './app'
import { initApiWorker } from './api'

initApiWorker()

render(<App />, document.getElementById('root'))
