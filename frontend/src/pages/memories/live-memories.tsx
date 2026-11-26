import { css } from '@linaria/core'

import { setLiveMemoryState } from '../../api'
import { apiState } from '../../api/api-state'
import { useApiState } from '../../hooks/api'
import { getHotkeyLabel } from '../../hooks/hotkey'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { SearchState } from '../../hooks/search'
import { NoSearchResults } from '../../ui/components/no-search-results'
import { getLiveMemoryTitle } from '../../util/entities'
import {
  StatelessLiveMemoryWidget,
  editLiveMemory,
} from '../../widgets/memory/stateless-live-memory-widget'
import { entityUiMapping } from '../config/entities/entity-ui-mapping'

import { LiveMemoriesMultiControl } from './live-memories-multi-control'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

const addLiveMemory = async () => {
  const result = await editLiveMemory()
  if (result === null) return

  const newId = String(
    Math.max(0, ...Object.keys(apiState.liveMemories).map(it => parseInt(it))) +
      1
  )

  setLiveMemoryState(newId, {
    ...entityUiMapping.memories!.newEntityFactory!().scenes[0],
    value: 255,
    on: false,
    name: result.name || undefined,
    members: result.members,
  })
}

export interface LiveMemoriesProps {
  startHotkeyIndex?: number
  activeHotkeyIndex?: number | null
  /** Search to filter the widgets by title. */
  search?: Pick<SearchState, 'active' | 'matches'>
}

/**
 * Displays
 * - a button to add a live memory
 * - a multi-control
 * - widgets for all live memory
 */
export const LiveMemories = ({
  startHotkeyIndex,
  activeHotkeyIndex,
  search,
}: LiveMemoriesProps) => {
  const liveMemories = useApiState('liveMemories')
  const entries = Object.entries(liveMemories).filter(
    ([id, memory]) =>
      !search?.active || search.matches(getLiveMemoryTitle(id, memory))
  )

  return (
    <div className={container}>
      <Header
        level={3}
        rightContent={
          <Icon
            title="Add live memory"
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
        {entries.map(([id, memory], index) => (
          <StatelessLiveMemoryWidget
            key={id}
            title={getLiveMemoryTitle(id, memory)}
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
      {search?.active && entries.length === 0 && <NoSearchResults />}
    </div>
  )
}
