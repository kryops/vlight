import { LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { ChannelType } from '@vlight/controls'

import { setLiveChaseState } from '../../api'
import { useApiState } from '../../hooks/api'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { StatelessLiveChaseWidget } from '../../widgets/chase/stateless-live-chase-widget'
import { showPromptDialog } from '../../ui/overlays/dialog'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

function getNewLiveChase(): LiveChase {
  return {
    on: false,
    stopped: true,
    value: 255,
    members: [],
    light: { from: 0.2, to: 1 },
    speed: 1,
    colors: [
      { channels: { [ChannelType.Master]: 255, [ChannelType.Red]: 255 } },
    ],
    colorsDraft: null,
    single: true,
    burst: false,
    fadeLockedToSpeed: true,
  }
}

/**
 * Displays widgets for all live chases.
 */
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
            onClick={async () => {
              const name = await showPromptDialog({
                title: 'Add Live Chase',
                label: 'Name',
              })
              if (name === undefined) return

              const newId = String(
                Math.max(
                  0,
                  ...Object.keys(liveChases).map(it => parseInt(it))
                ) + 1
              )
              setLiveChaseState(newId, {
                ...getNewLiveChase(),
                name: name || undefined,
              })
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
            title={liveChase.name ?? `Live Chase ${id}`}
            id={id}
            state={liveChase}
          />
        ))}
      </div>
    </div>
  )
}
