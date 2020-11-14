import { Link } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { iconBack } from '../icons'

import { BackLink } from './back-link'

export interface BackArrowProps {
  to?: string
}

export function BackArrow({ to }: BackArrowProps) {
  const backArrow = <Icon icon={iconBack} inline shade={1} />

  if (!to) {
    return <BackLink>{backArrow}</BackLink>
  }

  return <Link to={to}>{backArrow}</Link>
}
