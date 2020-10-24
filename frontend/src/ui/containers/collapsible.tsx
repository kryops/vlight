import { css } from 'linaria'
import { ReactNode, useState } from 'react'

import { useClassNames } from '../../hooks/ui'
import { iconCollapse, iconExpand } from '../icons'
import { Icon } from '../icons/icon'
import { baseline, primaryShade } from '../styles'

const container = css`
  margin-bottom: ${baseline(2)};
  border: 1px solid ${primaryShade(2)};
`

const container_light = css`
  border: 1px solid ${primaryShade(3, true)};
`

const header = css`
  padding: ${baseline(2)};
  background: ${primaryShade(2)};
  cursor: pointer;
`

const header_light = css`
  background: ${primaryShade(3, true)};
`

const content = css`
  padding: ${baseline(2)};
`

export interface CollapsibleProps {
  title: ReactNode
  children: ReactNode
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(false)
  const [containerClassName, headerClassName] = useClassNames(
    [container, container_light],
    [header, header_light]
  )

  const toggle = () => setExpanded(!expanded)

  return (
    <div className={containerClassName}>
      <div className={headerClassName} onClick={toggle}>
        <Icon icon={expanded ? iconCollapse : iconExpand} inline />
        {title}
      </div>
      {expanded && <div className={content}>{children}</div>}
    </div>
  )
}
