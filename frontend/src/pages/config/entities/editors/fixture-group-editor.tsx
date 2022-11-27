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
        rightClassName={editorPreviewColumn}
        fixed
      />
    </>
  )
}
