import { createRoot } from 'react-dom/client'

import App from './app'
import { initApiWorker } from './api'

initApiWorker()

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
