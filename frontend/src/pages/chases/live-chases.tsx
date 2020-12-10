import { LiveChase } from '@vlight/types'
import { css } from '@linaria/core'

import { setLiveChaseState } from '../../api'
import { useApiState } from '../../hooks/api'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { StatelessLiveChaseWidget } from '../../widgets/chase/stateless-live-chase-widget'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

function getNewLiveChase(): LiveChase {
  return {
    on: false,
    value: 255,
    members: [],
    light: { from: 0.2, to: 1 },
    speed: 1,
    colors: [{ channels: { m: 255, r: 255 } }],
  }
}

export function LiveChases() {
  const liveChases = useApiState('liveChases')

  return (
    <div className={container}>
      <Header
        level={3}
        rightContent={
          <Icon
            icon={iconAdd}
            size={8}
            hoverable
            inline
            onClick={() => {
              const newId = String(
                Math.max(
                  0,
                  ...Object.keys(liveChases).map(it => parseInt(it))
                ) + 1
              )
              setLiveChaseState(newId, getNewLiveChase())
            }}
          />
        }
      >
        Live Chases
      </Header>
      <div className={cx(pageWithWidgets, widgetContainer)}>
        {Object.entries(liveChases).map(([id, liveChase]) => (
          <StatelessLiveChaseWidget
            key={id}
            title={`Live Chase ${id}`}
            id={id}
            state={liveChase}
          />
        ))}
      </div>
      {/* <div>
        <br />
        {Object.entries(liveChases).map(([id, liveChase]) => (
          <p key={id}>
            {id}: {JSON.stringify(liveChase)}
          </p>
        ))}
      </div> */}
    </div>
  )
}
