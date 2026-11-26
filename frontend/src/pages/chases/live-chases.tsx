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
import { SearchState } from '../../hooks/search'
import { NoSearchResults } from '../../ui/components/no-search-results'
import { getLiveChaseTitle } from '../../util/entities'
import { StatelessLiveChaseWidget } from '../../widgets/chase/stateless-live-chase-widget'
import { showPromptDialog } from '../../ui/overlays/dialog'
import { apiState } from '../../api/api-state'
import { getHotkeyLabel } from '../../hooks/hotkey'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'

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

const addLiveChase = async () => {
  let members: string[] = []

  const name = await showPromptDialog({
    title: 'Add Live Chase',
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
    Math.max(0, ...Object.keys(apiState.liveChases).map(it => parseInt(it))) + 1
  )
  setLiveChaseState(newId, {
    ...getNewLiveChase(),
    members,
    name: name || undefined,
  })
}

export interface LiveChasesProps {
  startHotkeyIndex?: number
  activeHotkeyIndex?: number | null
  /** Search to filter the widgets by title. */
  search?: Pick<SearchState, 'active' | 'matches'>
}

/**
 * Displays widgets for all live chases.
 */
export const LiveChases = ({
  startHotkeyIndex,
  activeHotkeyIndex,
  search,
}: LiveChasesProps) => {
  const liveChases = useApiState('liveChases')
  const entries = Object.entries(liveChases).filter(
    ([id, liveChase]) =>
      !search?.active || search.matches(getLiveChaseTitle(id, liveChase))
  )

  return (
    <div className={container}>
      <Header
        level={3}
        rightContent={
          <Icon
            title="Add live chase"
            icon={iconAdd}
            size={8}
            hoverable
            inline
            onClick={addLiveChase}
          />
        }
      >
        Live Chases
      </Header>
      <div className={cx(pageWithWidgets, widgetContainer)}>
        {entries.map(([id, liveChase], index) => (
          <StatelessLiveChaseWidget
            key={id}
            title={getLiveChaseTitle(id, liveChase)}
            id={id}
            state={liveChase}
            hotkeysActive={activeHotkeyIndex === index}
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
