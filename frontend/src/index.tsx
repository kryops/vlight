import React from 'react'
import { render } from 'react-dom'

import '@babel/polyfill' // tslint:disable-line ordered-imports

import App from './app'

render(<App />, document.getElementById('root'))
