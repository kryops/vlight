import { css } from '@linaria/core'

import { useFormState } from '../../../../hooks/form'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { CheckboxLabel } from '../../../../ui/forms/checkbox'
import { FormSelect, FormTextInput } from '../../../../ui/forms/form-input'
import { Label } from '../../../../ui/forms/label'
import { iconRevert } from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline } from '../../../../ui/styles'
import { EntityEditorProps } from '../types'

import { ActionsEditor } from './actions/actions-editor'

const container = css`
  width: 90vw;
  max-width: 1400px;
`

const sectionHeader = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(4)};
  margin-top: ${baseline(6)};

  & > h3 {
    margin: 0;
  }
`

const revertAllToggle = css`
  cursor: pointer;
`

const description = css`
  font-size: 0.85rem;
  opacity: 0.8;
  margin: ${baseline(2)} 0;
`

/**
 * Dialog content to edit a programmable button.
 */
export function ButtonEditor({
  entry,
  onChange,
}: EntityEditorProps<'buttons'>) {
  const formState = useFormState(entry, { onChange })
  const { values } = formState

  const toggleMode = values.mode === 'toggle'
  const releaseName = toggleMode ? 'second press' : 'release'

  const allReverted =
    values.down.length > 0 && values.down.every(action => action.revert)

  const toggleRevertAll = () =>
    formState.changeValue(
      'down',
      values.down.map(action => ({ ...action, revert: !allReverted }))
    )

  return (
    <div className={container}>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Button</h2>
      <Label
        label="Label"
        input={<FormTextInput formState={formState} name="label" />}
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

      <Label
        label="Hotkey"
        input={<FormTextInput formState={formState} name="hotkey" />}
        description={
          <>
            Key to press the button with, e.g. &quot;q&quot; or
            &quot;Shift+a&quot;. Only active on pages displaying the button, and
            only while no other widget is selected via the number keys.
          </>
        }
      />

      <Label
        label="Mode"
        input={
          <FormSelect
            formState={formState}
            name="mode"
            entries={[
              { value: undefined, label: 'Flash: Active while pressed' },
              { value: 'toggle', label: 'Toggle: Press again to deactivate' },
            ]}
          />
        }
      />

      <div className={sectionHeader}>
        <h3>Press</h3>
        <CheckboxLabel
          className={revertAllToggle}
          value={allReverted}
          onChange={toggleRevertAll}
          title={`Reverts the changes of all actions on ${releaseName}`}
        >
          <Icon icon={iconRevert} inline shade={1} /> Revert all on{' '}
          {releaseName}
        </CheckboxLabel>
      </div>
      <div className={description}>
        Executed when the button is pressed. Reverted changes are only restored
        for entities whose state was not changed in the meantime.
      </div>
      <ActionsEditor
        actions={values.down}
        onChange={down => formState.changeValue('down', down)}
        revertable
        revertLabel={`Revert on ${releaseName}`}
      />

      <div className={sectionHeader}>
        <h3>Release</h3>
      </div>
      <div className={description}>
        Executed when the button is released, after reverting the changes of the
        press actions.
      </div>
      <ActionsEditor
        actions={values.up}
        onChange={up => formState.changeValue('up', up)}
      />
    </div>
  )
}
