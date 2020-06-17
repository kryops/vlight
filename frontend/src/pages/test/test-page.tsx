import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { pageWithWidgets } from '../../ui/css/page'
import { DynamicWidget } from '../../widgets/dynamic'
import { showDialog } from '../../ui/overlays/dialog'
import { okCancel } from '../../ui/overlays/buttons'

const TestPage = memoInProduction(() => {
  const masterData = useMasterData()

  return (
    <div>
      <h1>Test Page</h1>
      <h2>Overlay / Modal / Dialog</h2>
      <a onClick={() => showDialog('sadsdfsdf', okCancel)}>Dialog</a>
      <h2>Grid</h2>
      <Grid
        headline="Gridddd"
        cells={[
          {
            children: (
              <>
                <DynamicWidget config={{ type: 'universe', from: 1, to: 22 }} />
                <DynamicWidget config={{ type: 'channels', from: 1, to: 8 }} />
              </>
            ),
          },
          {
            children: (
              <>
                <DynamicWidget config={{ type: 'channels', from: 1, to: 3 }} />
                <DynamicWidget config={{ type: 'channels', from: 1, to: 3 }} />
              </>
            ),
            factor: 2,
          },
          {
            children: '3',
          },
        ]}
      />
      <h2>Widgets</h2>
      <div className={pageWithWidgets}>
        <DynamicWidget config={{ type: 'universe', from: 1, to: 22 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 8 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 4 }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture-group', id: 'multi' }} />
      </div>
      <h2>Master data</h2>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
})

export default TestPage
