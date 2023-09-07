import { Fixture } from '@vlight/types/entities'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormFixtureListInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { useMasterData } from '../../../../hooks/api'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import { editorPreviewColumn } from '../../../../ui/css/editor-styles'
import { useFixtureList } from '../../../../hooks/fixtures'
import { useEvent } from '../../../../hooks/performance'

/**
 * Dialog content to edit a fixture group.
 *
 * Displays a fixture selection as well as a map preview.
 */
export function FixtureGroupEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtureGroups'>) {
  const formState = useFormState(entry, { onChange })
  const masterData = useMasterData()

  const fixtureIds = useFixtureList(formState.values.fixtures)

  const toggleFixture = useEvent((fixture: Fixture) => {
    const isActive = formState.values.fixtures.includes(fixture.id)

    // fixture active, but through a mapping
    if (!isActive && fixtureIds.includes(fixture.id)) {
      return
    }

    formState.changeValue(
      'fixtures',
      isActive
        ? formState.values.fixtures.filter(it => it !== fixture.id)
        : [...formState.values.fixtures, fixture.id]
    )
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
            onFixtureDown={toggleFixture}
          />
        }
        rightClassName={editorPreviewColumn}
        fixed
      />
    </>
  )
}
