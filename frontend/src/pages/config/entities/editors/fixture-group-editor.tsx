import React from 'react'
import { mapFixtureList } from '@vlight/controls'

import { useFormState } from '../../../../hooks/form'
import { FormTextInput, FormArrayInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { FixtureInputWithoutGroups } from '../../../../ui/forms/fixture-input'
import { useMasterData, useMasterDataMaps } from '../../../../hooks/api'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'

export function FixtureGroupEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtureGroups'>) {
  const formState = useFormState(entry, { onChange })
  const masterData = useMasterData()
  const masterDataMaps = useMasterDataMaps()

  const fixtureIds = mapFixtureList(formState.values.fixtures, {
    masterData,
    masterDataMaps,
  })

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
      <StatelessMapWidget
        fixtures={masterData.fixtures}
        highlightedFixtures={fixtureIds}
        standalone
      />
    </>
  )
}
