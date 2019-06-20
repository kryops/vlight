import { css } from 'linaria'
import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { DynamicWidget } from '../../widgets/dynamic'
import { baselinePx } from '../../ui/styles'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'

const widgetContainer = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baselinePx}px;
  margin-right: ${baselinePx * 8}px; // to allow scrolling

  ${flexEndSpacer}
`

const _TestPage: React.SFC = () => {
  const masterData = useMasterData()

  return (
    <div>
      <h2>Test Page</h2>
      <h3>Widgets</h3>
      <div className={widgetContainer}>
        <DynamicWidget config={{ type: 'universe', from: 1, to: 22 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 8 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 4 }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture-group', id: 'multi' }} />
      </div>
      <h3>Master data</h3>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
}

export default memoInProduction(_TestPage)
