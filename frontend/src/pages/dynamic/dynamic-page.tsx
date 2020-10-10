import React from 'react'
import { useParams } from 'react-router'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { DynamicWidget } from '../../widgets/dynamic-widget'
import { Header } from '../../ui/containers/header'

import { DynamicPageActions } from './dynamic-page-actions'

const DynamicPage = memoInProduction(() => {
  const { id } = useParams<{ id: string }>()
  const masterData = useMasterData()
  const page = masterData.dynamicPages.find(p => p.id === id)
  if (!page) return null

  const { headline, rows } = page

  return (
    <div>
      <Header rightContent={<DynamicPageActions dynamicPage={page} />}>
        {headline}
      </Header>
      {rows.map(({ headline, cells }, index) => (
        <Grid
          key={index}
          headline={headline}
          cells={cells.map(({ factor, widgets }) => ({
            factor,
            children: (
              <>
                {widgets.map((widget, index) => (
                  <DynamicWidget key={index} config={widget} />
                ))}
              </>
            ),
          }))}
        />
      ))}
    </div>
  )
})

export default DynamicPage
