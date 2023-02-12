import { css } from '@linaria/core'

import { setLiveMemoryState } from '../../api'
import { apiState } from '../../api/api-state'
import { useApiState } from '../../hooks/api'
import { getHotkeyLabel } from '../../hooks/hotkey'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { showPromptDialog } from '../../ui/overlays/dialog'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { StatelessLiveMemoryWidget } from '../../widgets/memory/stateless-live-memory-widget'
import { entityUiMapping } from '../config/entities/entity-ui-mapping'

import { LiveMemoriesMultiControl } from './live-memories-multi-control'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

const addLiveMemory = async () => {
  let members: string[] = []

  const name = await showPromptDialog({
    title: 'Add Live Memory',
    label: 'Name',
    additionalContent: (
      <>
        <br />
        <FixtureListEditor
          value={[]}
          onChange={newValue => (members = newValue)}
          ordering
        />
      </>
    ),
  })
  if (name === undefined) return

  const newId = String(
    Math.max(0, ...Object.keys(apiState.liveMemories).map(it => parseInt(it))) +
      1
  )

  setLiveMemoryState(newId, {
    ...entityUiMapping.memories!.newEntityFactory!().scenes[0],
    value: 255,
    on: false,
    name: name || undefined,
    members,
  })
}

export interface LiveMemoriesProps {
  startHotkeyIndex?: number
  activeHotkeyIndex?: number | null
}

/**
 * Displays
 * - a button to add a live memory
 * - a multi-control
 * - widgets for all live memory
 */
export const LiveMemories = memoInProduction(
  ({ startHotkeyIndex, activeHotkeyIndex }: LiveMemoriesProps) => {
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
              onClick={addLiveMemory}
            />
          }
        >
          Live Memories
        </Header>

        <LiveMemoriesMultiControl />

        <div className={cx(pageWithWidgets, widgetContainer)}>
          {Object.entries(liveMemories).map(([id, memory], index) => (
            <StatelessLiveMemoryWidget
              key={id}
              title={memory.name ?? `Live Memory ${id}`}
              id={id}
              state={memory}
              hotkeysActive={index === activeHotkeyIndex}
              cornerLabel={
                startHotkeyIndex !== undefined
                  ? getHotkeyLabel(startHotkeyIndex + index)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    )
  }
)
