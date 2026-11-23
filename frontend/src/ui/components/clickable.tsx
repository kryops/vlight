import { css } from '@linaria/core'
import { JSX } from 'react'

import { cx } from '../../util/styles'

export type LinkProps = JSX.IntrinsicElements['a']

const clickable = css`
  cursor: pointer;
`

/**
 * Container element that can be clicked on.
 *
 * Exposed as button to assistive technology unless another role is given.
 */
export function Clickable(props: LinkProps) {
  if (props.onClick) {
    return (
      <a role="button" {...props} className={cx(props.className, clickable)} />
    )
  } else {
    return <span {...props} />
  }
}
