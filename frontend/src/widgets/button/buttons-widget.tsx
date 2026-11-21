import { css } from '@linaria/core'
import { IdType } from '@vlight/types'
import { isTruthy } from '@vlight/utils'

import { useMasterDataMaps } from '../../hooks/api'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { iconButton } from '../../ui/icons'
import { baseline } from '../../ui/styles'

import { ProgrammableButtonControl } from './programmable-button'

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${baseline(2)};
`

export interface ButtonsWidgetProps extends WidgetPassthrough {
  ids: IdType[]
  title?: string
}

/**
 * Widget to display multiple programmable buttons.
 */
export const ButtonsWidget = ({
  ids,
  title,
  ...passThrough
}: ButtonsWidgetProps) => {
  const { buttons } = useMasterDataMaps()
  const buttonsToDisplay = ids.map(id => buttons.get(id)).filter(isTruthy)

  if (!buttonsToDisplay.length) return null

  return (
    <Widget
      icon={title ? iconButton : undefined}
      title={title}
      {...passThrough}
    >
      <div className={container}>
        {buttonsToDisplay.map(button => (
          <ProgrammableButtonControl key={button.id} button={button} />
        ))}
      </div>
    </Widget>
  )
}
