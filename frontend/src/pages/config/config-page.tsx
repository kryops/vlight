import React from 'react'
import { Link } from 'react-router-dom'

import { memoInProduction } from '../../util/development'
import { settingsPageRoute } from '../routes'

const ConfigPage = memoInProduction(() => {
  return (
    <div>
      <h1>Config</h1>
      <Link to={settingsPageRoute}>Settings</Link>
    </div>
  )
})

export default ConfigPage
