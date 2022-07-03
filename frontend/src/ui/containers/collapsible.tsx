import { css } from '@linaria/core'
import { ReactNode, useState } from 'react'

import { iconCollapse, iconExpand } from '../icons'
import { Icon } from '../icons/icon'
import { baseline, primaryShade } from '../styles'

const container = css`
  margin-bottom: ${baseline(2)};
  border: 1px solid ${primaryShade(2)};
`

const header = css`
  padding: ${baseline(2)};
  background: ${primaryShade(2)};
  cursor: pointer;
`

const content = css`
  padding: ${baseline(2)};
`

export interface CollapsibleProps {
  title: ReactNode
  children: ReactNode
}

/**
 * Container for collapsible / expandable content.
 *
 * Collapsed by default.
 */
export function Collapsible({ title, children }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(false)

  const toggle = () => setExpanded(!expanded)

  return (
    <div className={container}>
      <div className={header} onClick={toggle}>
        <Icon icon={expanded ? iconCollapse : iconExpand} inline />
        {title}
      </div>
      {expanded && <div className={content}>{children}</div>}
    </div>
  )
}
