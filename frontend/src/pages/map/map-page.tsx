import { css } from '@linaria/core'

import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { MapWidget } from '../../widgets/map/map-widget'
import { baseline } from '../../ui/styles'

export const page = css`
  margin: -${baseline(1)};
`

const MapPage = memoInProduction(() => {
  return (
    <>
      <Header>Map</Header>
      <div className={page}>
        <MapWidget standalone={true} />
      </div>
    </>
  )
})

export default MapPage
