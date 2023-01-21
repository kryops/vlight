import { css } from '@linaria/core'
import { FixtureMappingPrefix } from '@vlight/controls'
import { useCallback } from 'react'
import { identity } from '@vlight/utils'

import { iconDelete, iconDrag } from '../icons'
import { Icon } from '../icons/icon'
import { useMasterDataMaps, useRawMasterData } from '../../hooks/api'
import { baseline, primaryShade } from '../styles'
import { SortableList } from '../containers/sortable-list'
import { cx } from '../../util/styles'
import { memoInProduction } from '../../util/development'
import { useEvent } from '../../hooks/performance'

const container = css`
  margin-top: ${baseline()};
  min-height: min(${baseline(84)}, 80vh);
  flex-grow: 1;
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

  /**
   * Reduces the minimum height if set.
   *
   * Default to `false`.
   */
  compact?: boolean
}

/**
 * Sortable list of fixture mapping strings.
 */
export const SortableFixtureMapping = memoInProduction(
  ({ value, onChange, compact }: SortableFixtureMappingProps) => {
    const rawMasterData = useRawMasterData()
    const masterDataMaps = useMasterDataMaps()

    const deleteEntry = useEvent((entry: string) =>
      onChange((value ?? []).filter(it => it !== entry))
    )

    const renderEntryContent = useCallback(
      (entry: string) => {
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
              onClick={() => deleteEntry(entry)}
            />
          </>
        )
      },
      [rawMasterData, masterDataMaps, deleteEntry]
    )

    return (
      <SortableList
        entries={value}
        getKey={identity}
        onChange={onChange}
        containerClassName={cx(container, compact && container_compact)}
        entryClassName={entryStyle}
        renderEntryContent={renderEntryContent}
      />
    )
  }
)
