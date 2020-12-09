import { css } from '@linaria/core'
import { ReactNode } from 'react'

import { baseline, textShade } from '../styles'
import { cx } from '../../util/styles'

export interface LabelProps {
  label: string | ReactNode
  description?: string | ReactNode
  input: ReactNode
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

export function Label({ label, input, description, forceSmall }: LabelProps) {
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
