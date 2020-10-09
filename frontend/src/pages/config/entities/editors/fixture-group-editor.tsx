import React from 'react'
import { mapFixtureList } from '@vlight/controls'
import { css } from 'linaria'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormFixtureListInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { useMasterData, useMasterDataMaps } from '../../../../hooks/api'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'

const previewColumn = css`
  text-align: center;
`

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
      <TwoColumDialogContainer
        left={
          <>
            <Label
              label="Name"
              input={<FormTextInput formState={formState} name="name" />}
            />
            <p>Fixtures</p>
            <FormFixtureListInput
              formState={formState}
              name="fixtures"
              hideGroupMode
              ordering
            />
          </>
        }
        right={
          <StatelessMapWidget
            fixtures={masterData.fixtures}
            highlightedFixtures={fixtureIds}
          />
        }
        rightClassName={previewColumn}
        fixed
      />
    </>
  )
}
