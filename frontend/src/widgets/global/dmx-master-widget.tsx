import { css } from '@linaria/core'

import { setDmxMaster } from '../../api'
import { useApiState } from '../../hooks/api'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { iconGlobal } from '../../ui/icons'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

const buttonContainer = css`
  margin: 0 ${baseline()};
`

export type DmxMasterWidgetProps = WidgetPassthrough

const setMasterValue = (value: number) => setDmxMaster({ value })
const setToFull = () => setDmxMaster({ value: 255 })
const setToZero = () => setDmxMaster({ value: 0 })
const setMasterFade = (fade: number) => setDmxMaster({ fade })

export const DmxMasterWidget = memoInProduction(
  ({ ...passThrough }: DmxMasterWidgetProps) => {
    const dmxMaster = useApiState('dmxMaster')
    const dmxMasterFade = useApiState('dmxMasterFade')

    return (
      <Widget title="DMX Master" icon={iconGlobal} {...passThrough}>
        <Fader max={255} step={1} value={dmxMaster} onChange={setMasterValue} />
        <div className={buttonContainer}>
          <Button block onDown={setToFull} title="Set to full" hotkey="n">
            ON
          </Button>
          <Button block onDown={setToZero} title="Set to zero" hotkey="m">
            OFF
          </Button>
        </div>
        <Fader
          min={10}
          max={0}
          value={dmxMasterFade}
          onChange={setMasterFade}
          label="Fade"
          subLabel={
            dmxMasterFade === 0 ? 'Instant' : `${dmxMasterFade.toFixed(2)}s`
          }
        />
      </Widget>
    )
  }
)
