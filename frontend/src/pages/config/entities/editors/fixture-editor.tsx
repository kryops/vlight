import { Fixture } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'
import { useState } from 'react'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormNumberInput,
  FormEntityReferenceSelect,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../entity-ui-mapping'
import { Label } from '../../../../ui/forms/label'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'
import { useMasterData } from '../../../../hooks/api'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  autoWidthInput,
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'
import { Select } from '../../../../ui/forms/select'

/**
 * Dialog content to edit a fixture definition.
 *
 * Displays a form as well as a map preview.
 */
export function FixtureEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtures'>) {
  const id = entry.id
  const formState = useFormState(entry, { onChange })
  const masterData = useMasterData()
  const [sharing, setSharing] = useState(!!entry.fixturesSharingChannel)

  const { x, y, xOffset, yOffset, count } = formState.values

  const idSuffixes = createRangeArray(1, count ?? 1)
  const positionedFixtureEntries =
    x !== undefined &&
    y !== undefined &&
    idSuffixes.map<Fixture>((count, index) => ({
      ...formState.values,
      id: `${id}_${count}`,
      x: x + index * (xOffset ?? 8),
      y: y + index * (yOffset ?? 0),
      originalId: id,
    }))

  const previewFixtures = [
    ...masterData.fixtures.filter(
      fixture => fixture.id !== id && fixture.originalId !== id
    ),
    ...(positionedFixtureEntries || []),
  ]

  return (
    <>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Fixture</h2>
      <TwoColumDialogContainer
        left={
          <>
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
                    className={autoWidthInput}
                  />
                  {' / '}
                  <FormNumberInput
                    formState={formState}
                    name="y"
                    min={0}
                    max={100}
                    className={autoWidthInput}
                  />
                </>
              }
            />
            <h4>Multiple Fixtures</h4>
            <Select
              entries={[
                { value: false, label: 'Subsequent channels' },
                { value: true, label: 'Sharing the same channel' },
              ]}
              value={sharing}
              onChange={value => {
                setSharing(value)
                if (value) {
                  formState.changeValue(
                    'fixturesSharingChannel',
                    formState.values.count ?? 1
                  )
                  formState.changeValue('count', undefined)
                } else {
                  formState.changeValue(
                    'count',
                    formState.values.fixturesSharingChannel ?? 1
                  )
                  formState.changeValue('fixturesSharingChannel', undefined)
                }
              }}
            />
            <Label
              label="Count"
              input={
                <FormNumberInput
                  formState={formState}
                  name={sharing ? 'fixturesSharingChannel' : 'count'}
                  min={1}
                />
              }
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
                    className={autoWidthInput}
                  />
                  {' / '}
                  <FormNumberInput
                    formState={formState}
                    name="yOffset"
                    min={-100}
                    max={100}
                    className={autoWidthInput}
                  />
                </>
              }
            />
          </>
        }
        right={
          <StatelessMapWidget
            fixtures={previewFixtures}
            highlightedFixtures={
              positionedFixtureEntries
                ? positionedFixtureEntries.map(it => it.id)
                : undefined
            }
          />
        }
        rightClassName={editorPreviewColumn}
      />
    </>
  )
}
