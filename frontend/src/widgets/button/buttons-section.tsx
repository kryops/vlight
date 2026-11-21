import { css } from '@linaria/core'
import { Link } from 'react-router'

import { useMasterData } from '../../hooks/api'
import { entitiesPageRoute } from '../../pages/routes'
import {
  openEntityEditor,
  openEntityEditorForId,
} from '../../pages/config/entities/editors'
import { Button } from '../../ui/buttons/button'
import { Header } from '../../ui/containers/header'
import { iconAdd, iconConfig } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'

import { ProgrammableButtonControl } from './programmable-button'

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${baseline(4)} ${baseline(2)};
  margin-top: ${baseline(2)};
`

const entry = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${baseline()};
`

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
`

const addButton = () => openEntityEditor('buttons')

/**
 * Section displaying all programmable buttons, each with an edit button.
 */
export const ButtonsSection = () => {
  const { buttons } = useMasterData()

  return (
    <>
      <Header
        level={2}
        rightContent={
          <>
            <Button
              title="Add button"
              icon={iconAdd}
              transparent
              onClick={addButton}
            />
            <Link to={entitiesPageRoute('buttons')}>
              <Button title="Configure buttons" icon={iconConfig} transparent />
            </Link>
          </>
        }
      >
        Buttons
      </Header>
      <div className={container}>
        {buttons.map(button => (
          <div key={button.id} className={entry}>
            <ProgrammableButtonControl button={button} />
            <Icon
              title="Edit button"
              icon={iconConfig}
              onClick={() => openEntityEditorForId('buttons', button.id)}
              shade={1}
              hoverable
            />
          </div>
        ))}
        {buttons.length === 0 && (
          <span className={emptyHint}>No buttons configured yet</span>
        )}
      </div>
    </>
  )
}
