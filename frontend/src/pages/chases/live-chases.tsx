import { css } from 'linaria'

import { setLiveChaseState } from '../../api'
import { useApiState } from '../../hooks/api'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

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

              // TODO
              setLiveChaseState(newId, {
                on: true,
                value: 255,
                members: ['all:12x12'],
                light: { from: 0.2, to: 1 },
                speed: 1,
                colors: [
                  { channels: { m: 255, r: 255 } },
                  { channels: { m: 255, g: 255 } },
                ],
              })
            }}
          />
        }
      >
        Live Chases
      </Header>
      <div className={cx(pageWithWidgets, widgetContainer)}>
        {Object.entries(liveChases).map(([id, liveChase]) => (
          <p key={id}>
            {id}: {JSON.stringify(liveChase)}
          </p>
        ))}
      </div>
    </div>
  )
}
