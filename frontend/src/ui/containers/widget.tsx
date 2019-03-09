import React from 'react'

export interface Props {
  title?: string | React.ReactElement
  className?: string
}

export const Widget: React.SFC<Props> = ({ title, className, children }) => (
  <div className={className}>
    <h2>{title}</h2>
    {children}
  </div>
)
