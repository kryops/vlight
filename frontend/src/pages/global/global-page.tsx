import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { DmxMasterWidget } from '../../widgets/global/dmx-master-widget'

/**
 * Global page.
 *
 * Displays global controls.
 */
const GlobalPage = memoInProduction(() => {
  return (
    <>
      <Header>Global Controls</Header>
      <div className={pageWithWidgets}>
        <DmxMasterWidget />
      </div>
    </>
  )
})

export default GlobalPage
