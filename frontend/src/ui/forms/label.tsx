import { css } from '@linaria/core'
import { ReactNode } from 'react'

import { baseline, textShade } from '../styles'
import { cx } from '../../util/styles'

export interface LabelProps {
  /** Label to be displayed to the left (or above) the input. */
  label: string | ReactNode

  input: ReactNode

  /** Description to be displayed below the input. */
  description?: string | ReactNode

  /**
   * If set, disables the responsiveness and always displays the label above the input.
   *
   * Defaults to `false`.
   */
  forceSmall?: boolean
}

const breakpoint = '500px'

const container = css`
  padding: ${baseline(1)} 0;
`

const containerResponsive = css`
  align-items: flex-start;

  @media (min-width: ${breakpoint}) {
    display: flex;
  }
`

const labelContainer = css`
  padding-bottom: ${baseline(1)};
`

const labelContainerResponsive = css`
  @media (min-width: ${breakpoint}) {
    width: ${baseline(32)};
    padding-bottom: 0;
    padding-top: ${baseline()};
    padding-right: ${baseline(2)};
  }
`

const inputContainer = css`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
`

const descriptionStyle = css`
  margin-bottom: ${baseline()};
  color: ${textShade(1)};
  font-size: 80%;
`

/**
 * Component to wrap an input with a label.
 */
export function Label({
  label,
  input,
  description,
  forceSmall = false,
}: LabelProps) {
  return (
    <>
      <div className={cx(container, !forceSmall && containerResponsive)}>
        <div
          className={cx(
            labelContainer,
            !forceSmall && labelContainerResponsive
          )}
        >
          {label}
        </div>
        <div className={inputContainer}>{input}</div>
      </div>
      {description && <div className={descriptionStyle}>{description}</div>}
    </>
  )
}
