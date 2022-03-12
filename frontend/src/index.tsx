/// <reference types="react/next" />
/// <reference types="react-dom/next" />

// @ts-expect-error the /next types do not seem to work any more
import { createRoot } from 'react-dom'

import App from './app'
import { initApiWorker } from './api'

initApiWorker()

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
