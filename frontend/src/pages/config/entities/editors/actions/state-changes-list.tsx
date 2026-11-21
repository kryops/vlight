import { css } from '@linaria/core'
import { getPathValue, ObjectPath, removePathValue } from '@vlight/utils'

import { iconDelete } from '../../../../../ui/icons'
import { Icon } from '../../../../../ui/icons/icon'
import { baseline, primaryShade, textShade } from '../../../../../ui/styles'

import { formatStateChangeValue, getStateChangePaths } from './action-utils'

const container = css`
  margin-top: ${baseline(2)};
`

const headline = css`
  font-size: 0.85rem;
  color: ${textShade(1)};
  margin-bottom: ${baseline()};
`

const entry = css`
  display: flex;
  align-items: center;
  gap: ${baseline(2)};
  padding: ${baseline(0.5)} ${baseline(2)};
  border-bottom: 1px solid ${primaryShade(2)};
  font-size: 0.85rem;
`

const entryLabel = css`
  flex: 0 0 auto;
  font-weight: bold;
`

const entryValue = css`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
  font-size: 0.85rem;
`

function defaultGetLabel(path: ObjectPath): string {
  if (path[0] === 'channels' && path.length === 2) {
    return `Channel ${path[1].toUpperCase()}`
  }
  return path.join('.')
}

export interface StateChangesListProps<T extends object> {
  /** The partial state containing the changes. */
  state: T

  onChange: (state: T) => void

  /** Returns the label for a change. Defaults to its path. */
  getLabel?: (path: ObjectPath) => string
}

/**
 * Displays a list of the changes contained in a partial state,
 * each of which can be removed.
 */
export function StateChangesList<T extends object>({
  state,
  onChange,
  getLabel = defaultGetLabel,
}: StateChangesListProps<T>) {
  const paths = getStateChangePaths(state)

  return (
    <div className={container}>
      <div className={headline}>Changes</div>
      {paths.length === 0 && (
        <div className={emptyHint}>
          No changes yet. Change values above to record them.
        </div>
      )}
      {paths.map(path => (
        <div key={path.join('.')} className={entry}>
          <span className={entryLabel}>{getLabel(path)}</span>
          <span className={entryValue}>
            {formatStateChangeValue(getPathValue(state, path))}
          </span>
          <Icon
            title="Remove change"
            icon={iconDelete}
            hoverable
            onClick={() => onChange(removePathValue(state, path))}
          />
        </div>
      ))}
    </div>
  )
}
