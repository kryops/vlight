import React, { useState } from 'react'

import { useFormState } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { TextInput } from '../../../../ui/forms/typed-input'

export function FixtureTypeEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtureTypes'>) {
  const formState = useFormState(entry, { onChange })
  const [mappingString, setMappingString] = useState<string | undefined>(
    formState.values.mapping.join(',')
  )

  return (
    <>
      <h2>{entry.id ? 'Edit' : 'Add'} Fixture Type</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <Label
        label="Mapping"
        description="Comma-separated - Special values: m, r, g, b"
        input={
          <TextInput
            value={mappingString}
            onChange={newMappingString => {
              setMappingString(newMappingString)
              const newMapping = (newMappingString ?? '')
                .split(',')
                .map(it => it.trim())
                .filter(Boolean)
              formState.changeValue('mapping', newMapping)
            }}
          />
        }
      />
    </>
  )
}
