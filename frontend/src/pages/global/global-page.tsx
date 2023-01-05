import { pageWithWidgets } from '../../ui/css/page'
import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { DmxMasterWidget } from '../../widgets/global/dmx-master-widget'
import { useNumberHotkey } from '../../hooks/hotkey'

/**
 * Global page.
 *
 * Displays global controls.
 */
const GlobalPage = memoInProduction(() => {
  const activeHotkeyIndex = useNumberHotkey(1)

  return (
    <>
      <Header>Global Controls</Header>
      <div className={pageWithWidgets}>
        <DmxMasterWidget hotkeysActive={activeHotkeyIndex === 0} />
      </div>
    </>
  )
})

export default GlobalPage
