import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { iconAdd } from '../../../../ui/icons'
import { newDynamicPageFactory } from '../new-entity-factories'
import { Button } from '../../../../ui/buttons/button'
import { useEvent } from '../../../../hooks/performance'

import { DynamicPageRowEditor } from './dynamic-page-row-editor'

export interface DynamicPageEditProps
  extends EntityEditorProps<'dynamicPages'> {
  inline?: boolean
}

/**
 * Dialog content to edit a dynamic page.
 */
export function DynamicPageEditor({
  entry,
  onChange,
  inline,
}: DynamicPageEditProps) {
  const formState = useFormState(entry, { onChange })
  const rows = useFormStateArray(formState, 'rows')

  const addRow = useEvent(() => rows.add(newDynamicPageFactory().rows[0]))

  return (
    <>
      {!inline && (
        <h2 className={editorTitle}>
          {entry.id ? 'Edit' : 'Add'} Dynamic Page
        </h2>
      )}
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <Label
        label="Headline"
        input={<FormTextInput formState={formState} name="headline" />}
      />
      <Label
        label="Icon"
        input={<FormTextInput formState={formState} name="icon" />}
        description={
          <>
            Use an icon name from{' '}
            <a
              href="https://materialdesignicons.com/"
              target="_blank"
              rel="noreferrer"
            >
              https://materialdesignicons.com/
            </a>{' '}
            prefixed with &quot;mdi&quot; and converted to camelCase, e.g.
            &quot;mdiAirplaneLanding&quot;
          </>
        }
      />
      {rows.value.map((row, rowIndex) => (
        <DynamicPageRowEditor
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          formState={formState}
        />
      ))}
      <Button icon={iconAdd} block onClick={addRow}>
        Add row
      </Button>
    </>
  )
}
