import React from 'react'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormNumberInput,
  FormEntityReferenceSelect,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'

export function FixtureEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtures'>) {
  const formState = useFormState(entry, { onChange })

  return (
    <>
      <h2>{entry.id ? 'Edit' : 'Add'} Fixture</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
        description="Multiple fixtures: Use # as placeholder for the fixture number"
      />
      <Label
        label="Type"
        input={
          <FormEntityReferenceSelect
            formState={formState}
            name="type"
            entity="fixtureTypes"
          />
        }
      />
      <Label
        label="Channel"
        input={<FormNumberInput formState={formState} name="channel" />}
      />
      <Label
        label="Fixture count"
        input={<FormNumberInput formState={formState} name="count" />}
      />
    </>
  )
}
