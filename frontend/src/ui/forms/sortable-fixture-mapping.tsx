import { css } from '@linaria/core'
import { FixtureMappingPrefix } from '@vlight/controls'

import { iconDelete, iconDrag } from '../icons'
import { Icon } from '../icons/icon'
import { useMasterDataMaps, useRawMasterData } from '../../hooks/api'
import { baseline, primaryShade } from '../styles'
import { SortableList } from '../containers/sortable-list'
import { cx } from '../../util/styles'

const container = css`
  margin-top: ${baseline()};
  min-height: min(${baseline(84)}, 80vh);
`

const container_compact = css`
  min-height: min(${baseline(64)}, 80vh);
`

const entryStyle = css`
  display: flex;
  background: ${primaryShade(2)};
  margin-bottom: ${baseline()};
`

const entryButton = css`
  flex: 0 0 auto;
  padding: ${baseline(1)} ${baseline(2)};
`

const entryName = css`
  flex: 1 1 auto;
  padding: ${baseline(2)} 0;
`

export interface SortableFixtureMappingProps {
  value: string[]
  onChange: (newValue: string[]) => void
  compact?: boolean
}

export function SortableFixtureMapping({
  value,
  onChange,
  compact,
}: SortableFixtureMappingProps) {
  const rawMasterData = useRawMasterData()
  const masterDataMaps = useMasterDataMaps()

  return (
    <SortableList
      entries={value}
      getKey={value => value}
      onChange={onChange}
      containerClassName={cx(container, compact && container_compact)}
      entryClassName={entryStyle}
      renderEntryContent={entry => {
        let name: string

        if (entry.startsWith(FixtureMappingPrefix.All)) {
          const id = entry.slice(FixtureMappingPrefix.All.length)
          name = `[All]: ${
            rawMasterData.fixtures.find(fixture => fixture.id === id)?.name ??
            id
          }`
        } else if (entry.startsWith(FixtureMappingPrefix.Group)) {
          const id = entry.slice(FixtureMappingPrefix.Group.length)
          name = `[Group]: ${masterDataMaps.fixtureGroups.get(id)?.name ?? id}`
        } else if (entry.startsWith(FixtureMappingPrefix.Type)) {
          const id = entry.slice(FixtureMappingPrefix.Type.length)
          name = `[Type]: ${masterDataMaps.fixtureTypes.get(id)?.name ?? id}`
        } else {
          name = masterDataMaps.fixtures.get(entry)?.name ?? entry
        }

        return (
          <>
            <Icon className={entryButton} icon={iconDrag} />
            <div className={entryName}>{name}</div>
            <Icon
              className={entryButton}
              icon={iconDelete}
              hoverable
              onClick={() => onChange((value ?? []).filter(it => it !== entry))}
            />
          </>
        )
      }}
    />
  )
}
