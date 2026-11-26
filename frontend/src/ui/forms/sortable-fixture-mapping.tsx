import { css } from '@linaria/core'
import {
  FixtureMappingPrefix,
  hasFixtureMappingSegments,
  parseSegmentMemberId,
  splitSegmentsPrefix,
  toggleFixtureMappingSegments,
} from '@vlight/controls'
import { identity } from '@vlight/utils'

import { iconDelete, iconDrag, iconSegments } from '../icons'
import { Icon } from '../icons/icon'
import { useMasterDataAndMaps, useRawMasterData } from '../../hooks/api'
import { baseline, primaryShade } from '../styles'
import { SortableList } from '../containers/sortable-list'
import { cx } from '../../util/styles'

const container = css`
  margin-top: ${baseline()};
  min-height: min(${baseline(84)}, 80vh);
  flex-grow: 1;
`

const container_compact = css`
  min-height: ${baseline(48)};
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

  /**
   * Controls whether entries containing fixtures with segments
   * can be toggled to be split into their segments.
   *
   * Defaults to `false`.
   */
  segments?: boolean
}

/**
 * Sortable list of fixture mapping strings.
 */
export const SortableFixtureMapping = ({
  value,
  onChange,
  compact,
  segments = false,
}: SortableFixtureMappingProps) => {
  const rawMasterData = useRawMasterData()
  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterDataMaps } = masterDataAndMaps

  const deleteEntry = (entry: string) =>
    onChange((value ?? []).filter(it => it !== entry))

  const toggleEntrySegments = (entry: string) =>
    onChange(
      (value ?? []).map(it =>
        it === entry ? toggleFixtureMappingSegments(it) : it
      )
    )

  const renderEntryContent = (fullEntry: string) => {
    const { segments: isSplit, base: entry } = splitSegmentsPrefix(fullEntry)
    const segmentMember = masterDataMaps.fixtures.has(entry)
      ? undefined
      : parseSegmentMemberId(entry)
    const canSplit =
      segments &&
      !segmentMember &&
      hasFixtureMappingSegments(entry, masterDataAndMaps)
    let name: string

    if (entry.startsWith(FixtureMappingPrefix.All)) {
      const id = entry.slice(FixtureMappingPrefix.All.length)
      name = `[All]: ${
        rawMasterData.fixtures.find(fixture => fixture.id === id)?.name ?? id
      }`
    } else if (entry.startsWith(FixtureMappingPrefix.Group)) {
      const id = entry.slice(FixtureMappingPrefix.Group.length)
      name = `[Group]: ${masterDataMaps.fixtureGroups.get(id)?.name ?? id}`
    } else if (entry.startsWith(FixtureMappingPrefix.Type)) {
      const id = entry.slice(FixtureMappingPrefix.Type.length)
      name = `[Type]: ${masterDataMaps.fixtureTypes.get(id)?.name ?? id}`
    } else if (segmentMember) {
      const fixture = masterDataMaps.fixtures.get(segmentMember.fixtureId)
      name = `${fixture?.name ?? segmentMember.fixtureId} [Segment ${
        segmentMember.segment
      }]`
    } else {
      name = masterDataMaps.fixtures.get(entry)?.name ?? entry
    }

    return (
      <>
        <Icon className={entryButton} icon={iconDrag} />
        <div className={entryName}>{name}</div>
        {canSplit && (
          <Icon
            title={isSplit ? 'Merge segments' : 'Split into segments'}
            aria-pressed={isSplit}
            className={entryButton}
            icon={iconSegments}
            shade={isSplit ? 0 : 2}
            hoverable={!isSplit}
            onClick={() => toggleEntrySegments(fullEntry)}
          />
        )}
        <Icon
          title="Remove"
          className={entryButton}
          icon={iconDelete}
          hoverable
          onClick={() => deleteEntry(fullEntry)}
        />
      </>
    )
  }

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
