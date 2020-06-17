import React from 'react'
import { NavLink } from 'react-router-dom'

import { memoInProduction } from '../../util/development'

import { settingsPageRoute } from './settings'

const ConfigPage = memoInProduction(() => {
  return (
    <div>
      <h1>Config</h1>
      <NavLink to={settingsPageRoute}>Settings</NavLink>
    </div>
  )
})

export default ConfigPage
