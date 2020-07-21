import React from 'react'

import { useFormState } from '../../../../hooks/form'
import { FormTextInput, FormArrayInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { FixtureInputWithoutGroups } from '../../../../ui/forms/fixture-input'

export function FixtureGroupEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtureGroups'>) {
  const formState = useFormState(entry, { onChange })

  return (
    <>
      <h2>{entry.id ? 'Edit' : 'Add'} Fixture Group</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <Label
        label="Fixtures"
        input={
          <FormArrayInput
            formState={formState}
            name="fixtures"
            Input={FixtureInputWithoutGroups}
            displayRemoveButtons
          />
        }
      />
    </>
  )
}
