import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { pageWithWidgets } from '../../ui/css/page'
import { DynamicWidget } from '../../widgets/dynamic'
import { showDialog } from '../../ui/overlays/dialog'
import { okCancel } from '../../ui/overlays/modal'

const TestPage = memoInProduction(() => {
  const masterData = useMasterData()

  return (
    <div>
      <h2>Test Page</h2>
      <h3>Overlay / Modal / Dialog</h3>
      <a onClick={() => showDialog('sadsdfsdf', okCancel)}>Dialog</a>
      <h3>Grid</h3>
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
      <h3>Widgets</h3>
      <div className={pageWithWidgets}>
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
})

export default TestPage
