import { css } from '@linaria/core'

import { cx } from '../../util/styles'

export type LinkProps = JSX.IntrinsicElements['a']

const clickable = css`
  cursor: pointer;
`

/**
 * Container element that can be clicked on.
 */
export function Clickable(props: LinkProps) {
  if (props.onClick) {
    return <a {...props} className={cx(props.className, clickable)} />
  } else {
    return <span {...props} />
  }
}
