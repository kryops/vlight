import React from 'react'
import { css } from 'linaria'
import { Fixture } from '@vlight/types'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormNumberInput,
  FormEntityReferenceSelect,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'
import { useDmxUniverse } from '../../../../hooks/api'

const positionInput = css`
  width: auto;
`

export function FixtureEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtures'>) {
  const formState = useFormState(entry, { onChange })
  const universe = useDmxUniverse()

  const previewFixtures: Fixture[] = []

  const { x, y, xOffset, yOffset, count } = formState.values

  if (x !== undefined && y !== undefined) {
    previewFixtures.push(formState.values)
    if (count && count > 1) {
      for (let i = 1; i < count; i++) {
        previewFixtures.push({
          ...formState.values,
          x: x + i * (xOffset ?? 8),
          y: y + i * (yOffset ?? 0),
        })
      }
    }
  }

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
        label="Position"
        input={
          <>
            <FormNumberInput
              formState={formState}
              name="x"
              min={0}
              max={100}
              className={positionInput}
            />
            {' / '}
            <FormNumberInput
              formState={formState}
              name="y"
              min={0}
              max={100}
              className={positionInput}
            />
          </>
        }
      />
      <h4>Multiple Fixtures</h4>
      <Label
        label="Count"
        input={<FormNumberInput formState={formState} name="count" min={1} />}
      />
      <Label
        label="Position offset"
        input={
          <>
            <FormNumberInput
              formState={formState}
              name="xOffset"
              min={-100}
              max={100}
              className={positionInput}
            />
            {' / '}
            <FormNumberInput
              formState={formState}
              name="yOffset"
              min={-100}
              max={100}
              className={positionInput}
            />
          </>
        }
      />
      {previewFixtures.length > 0 && (
        <>
          <h4>Map Preview</h4>
          <StatelessMapWidget universe={universe} fixtures={previewFixtures} />
        </>
      )}
    </>
  )
}
