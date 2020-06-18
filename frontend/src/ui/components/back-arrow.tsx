import { Link } from 'react-router-dom'
import React from 'react'

import { Icon } from '../icons/icon'
import { iconBack } from '../icons'

export interface BackArrowProps {
  to: string
}

export function BackArrow({ to }: BackArrowProps) {
  return (
    <Link to={to}>
      <Icon icon={iconBack} inline shade={1} />
    </Link>
  )
}
