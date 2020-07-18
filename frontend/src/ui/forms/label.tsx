import React from 'react'
import { css } from 'linaria'

import { baseline, textShade } from '../styles'
import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'

export interface LabelProps {
  label: string | React.ReactNode
  description?: string | React.ReactNode
  input: React.ReactNode
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
`

const descriptionStyle = css`
  margin-bottom: ${baseline()};
  color: ${textShade(1)};
  font-size: 80%;
`

const descriptionStyle_light = css`
  color: ${textShade(2, true)};
`

export function Label({ label, input, description, forceSmall }: LabelProps) {
  const descriptionClass = useClassName(
    descriptionStyle,
    descriptionStyle_light
  )
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
      {description && <div className={descriptionClass}>{description}</div>}
    </>
  )
}
