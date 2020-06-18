import React from 'react'
import { css } from 'linaria'

import { cx } from '../../util/styles'

export type LinkProps = JSX.IntrinsicElements['a']

const clickable = css`
  cursor: pointer;
`

export function Clickable(props: LinkProps) {
  return (
    <a {...props} className={cx(props.className, props.onClick && clickable)} />
  )
}
