import { css } from '@linaria/core'

import { setDmxMaster } from '../../api'
import { useApiState } from '../../hooks/api'
import { Button } from '../../ui/buttons/button'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

const buttonContainer = css`
  margin-left: ${baseline(4)};
`

export const DmxMasterWidget = memoInProduction(() => {
  const dmxMaster = useApiState('dmxMaster')

  return (
    <Widget title="DMX Master">
      <Fader max={255} step={1} value={dmxMaster} onChange={setDmxMaster} />
      <div className={buttonContainer}>
        <Button block onDown={() => setDmxMaster(255)}>
          ON
        </Button>
        <Button block onDown={() => setDmxMaster(0)}>
          OFF
        </Button>
      </div>
    </Widget>
  )
})
