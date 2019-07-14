import React from 'react'
import { RouteComponentProps } from 'react-router'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { DynamicWidget } from '../../widgets/dynamic'

export type Props = RouteComponentProps<{ id: string }>

const _DynamicPage: React.SFC<Props> = ({ match }) => {
  const id = match.params.id
  const masterData = useMasterData()
  const page = masterData.dynamicPages.find(p => p.id === id)
  if (!page) return null

  const { headline, rows } = page

  return (
    <div>
      {headline && <h2>{headline}</h2>}
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
}

export default memoInProduction(_DynamicPage)
