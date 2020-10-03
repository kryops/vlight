import React, { useState } from 'react'
import { FixtureShape } from '@vlight/types'
import { css } from 'linaria'

import { useFormState } from '../../../../hooks/form'
import {
  FormNumberInput,
  FormSelect,
  FormTextInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { TextInput } from '../../../../ui/forms/typed-input'
import { SelectEntry } from '../../../../ui/forms/select'

const fixtureShapeEntries: SelectEntry<FixtureShape>[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
]

const sizeInput = css`
  width: auto;
`

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
      <Label
        label="Shape"
        input={
          <FormSelect
            entries={fixtureShapeEntries}
            formState={formState}
            name="shape"
          />
        }
      />
      <Label
        label="Size"
        description="X/Y - 0-100 (Default: 5x5)"
        input={
          <>
            <FormNumberInput
              formState={formState}
              name="xSize"
              min={0}
              max={100}
              className={sizeInput}
            />
            {' x '}
            <FormNumberInput
              formState={formState}
              name="ySize"
              min={0}
              max={100}
              className={sizeInput}
            />
          </>
        }
      />
    </>
  )
}
