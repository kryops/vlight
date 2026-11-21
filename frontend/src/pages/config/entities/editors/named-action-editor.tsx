import { css } from '@linaria/core'
import { useState } from 'react'
import { NamedAction } from '@vlight/types'

import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { Select } from '../../../../ui/forms/select'
import { TextInput } from '../../../../ui/forms/typed-input'
import { baseline } from '../../../../ui/styles'
import { EntityEditorProps } from '../types'

import { ActionContent, actionTypeEntries } from './actions/actions-editor'
import { createAction } from './actions/action-utils'

const container = css`
  width: 90vw;
  max-width: 1400px;
`

const content = css`
  margin-top: ${baseline(4)};
`

/**
 * Dialog content to edit a named action.
 */
export function NamedActionEditor({
  entry,
  onChange,
}: EntityEditorProps<'actions'>) {
  const [action, setAction] = useState(entry)

  const change = (newAction: NamedAction) => {
    setAction(newAction)
    onChange(newAction)
  }

  return (
    <div className={container}>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Action</h2>
      <Label
        label="Name"
        input={
          <TextInput
            value={action.name}
            onChange={name => change({ ...action, name })}
          />
        }
      />
      <Label
        label="Type"
        input={
          <Select
            entries={actionTypeEntries}
            value={action.type}
            onChange={type =>
              type !== action.type &&
              change({
                ...createAction(type),
                id: action.id,
                name: action.name,
              })
            }
          />
        }
      />
      <div className={content}>
        <ActionContent
          action={action}
          // the editors keep additional properties like `id` and `name`
          onChange={newAction => change(newAction as NamedAction)}
        />
      </div>
    </div>
  )
}
