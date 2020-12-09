import { css } from '@linaria/core'

import { setLiveMemoryState } from '../../api'
import { useApiState } from '../../hooks/api'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { StatelessLiveMemoryWidget } from '../../widgets/memory/stateless-live-memory-widget'
import { entityUiMapping } from '../config/entities/entity-ui-mapping'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

export function LiveMemories() {
  const liveMemories = useApiState('liveMemories')

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
                  ...Object.keys(liveMemories).map(it => parseInt(it))
                ) + 1
              )

              setLiveMemoryState(newId, {
                ...entityUiMapping.memories.newEntityFactory!().scenes[0],
                value: 255,
                on: false,
              })
            }}
          />
        }
      >
        Live Memories
      </Header>
      <div className={cx(pageWithWidgets, widgetContainer)}>
        {Object.entries(liveMemories).map(([id, memory]) => (
          <StatelessLiveMemoryWidget
            key={id}
            title={`Live Memory ${id}`}
            id={id}
            state={memory}
          />
        ))}
      </div>
    </div>
  )
}
