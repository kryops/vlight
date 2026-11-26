import { css } from '@linaria/core'
import {
  defaultLiveMovementCenter,
  defaultLiveMovementSpeed,
  liveMovementChannels,
} from '@vlight/controls'
import { LiveMovement } from '@vlight/types'

import { setLiveMovementState } from '../../api'
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
import { cx } from '../../util/styles'
import { SearchState } from '../../hooks/search'
import { NoSearchResults } from '../../ui/components/no-search-results'
import { getLiveMovementTitle } from '../../util/entities'
import { StatelessLiveMovementWidget } from '../../widgets/movement/stateless-live-movement-widget'

const container = css`
  margin-top: ${baseline(4)};
`

const widgetContainer = css`
  margin-right: ${baseline(0)};
`

function getNewLiveMovement(): LiveMovement {
  return {
    on: false,
    stopped: true,
    members: [],
    order: 'members',
    pattern: 'circle',
    center: { ...defaultLiveMovementCenter },
    scaleX: 64,
    scaleY: 64,
    rotation: 0,
    offset: 0,
    speed: defaultLiveMovementSpeed,
    invert: 'none',
  }
}

const addLiveMovement = async () => {
  let members: string[] = []

  const name = await showPromptDialog({
    title: 'Add Movement',
    label: 'Name',
    additionalContent: (
      <>
        <br />
        <FixtureListEditor
          value={[]}
          onChange={newValue => (members = newValue)}
          requiredChannels={liveMovementChannels}
          ordering
        />
      </>
    ),
  })
  if (name === undefined) return

  const newId = String(
    Math.max(
      0,
      ...Object.keys(apiState.liveMovements).map(it => parseInt(it))
    ) + 1
  )
  setLiveMovementState(newId, {
    ...getNewLiveMovement(),
    members,
    name: name || undefined,
  })
}

export interface LiveMovementsProps {
  startHotkeyIndex?: number
  activeHotkeyIndex?: number | null
  /** Search to filter the widgets by title. */
  search?: Pick<SearchState, 'active' | 'matches'>
}

/**
 * Displays widgets for all live movements.
 */
export const LiveMovements = ({
  startHotkeyIndex,
  activeHotkeyIndex,
  search,
}: LiveMovementsProps) => {
  const liveMovements = useApiState('liveMovements')
  const entries = Object.entries(liveMovements).filter(
    ([id, liveMovement]) =>
      !search?.active || search.matches(getLiveMovementTitle(id, liveMovement))
  )

  return (
    <div className={container}>
      <Header
        level={3}
        rightContent={
          <Icon
            title="Add movement"
            icon={iconAdd}
            size={8}
            hoverable
            inline
            onClick={addLiveMovement}
          />
        }
      >
        Movements
      </Header>
      <div className={cx(pageWithWidgets, widgetContainer)}>
        {entries.map(([id, liveMovement], index) => (
          <StatelessLiveMovementWidget
            key={id}
            title={getLiveMovementTitle(id, liveMovement)}
            id={id}
            state={liveMovement}
            hotkeysActive={
              startHotkeyIndex !== undefined &&
              activeHotkeyIndex === startHotkeyIndex + index
            }
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
