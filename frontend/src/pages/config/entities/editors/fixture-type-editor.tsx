import { useState } from 'react'
import { css } from '@linaria/core'
import { FixtureBorderStyle, FixtureShape } from '@vlight/types'
import { commaStringToArray, isUnique } from '@vlight/utils'
import { ChannelType, getMasterDependentChannels } from '@vlight/controls'

import { useFormState } from '../../../../hooks/form'
import {
  FormNumberInput,
  FormSelect,
  FormTextInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { TextInput } from '../../../../ui/forms/typed-input'
import { SelectEntry } from '../../../../ui/forms/select'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  AdditionalMapShape,
  StatelessMapWidget,
} from '../../../../widgets/map/stateless-map-widget'
import {
  autoWidthInput,
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'
import { useDeepEqualMemo } from '../../../../hooks/performance'
import { CheckboxLabel } from '../../../../ui/forms/checkbox'
import { MultiToggleInput } from '../../../../ui/forms/multi-toggle-input'
import { baseline } from '../../../../ui/styles'

const inlineToggleEntry = css`
  display: inline-block;
  margin-right: ${baseline()};
`

const fixtureShapeEntries: SelectEntry<FixtureShape>[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
]

const fixtureBorderStyleEntries: SelectEntry<FixtureBorderStyle>[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'dashed', label: 'Dashed' },
]

/**
 * Dialog content to edit a fixture type.
 *
 * Displays a form as well as a map shape preview.
 */
export function FixtureTypeEditor({
  entry,
  onChange,
}: EntityEditorProps<'fixtureTypes'>) {
  const formState = useFormState(entry, { onChange })
  const [mappingString, setMappingString] = useState<string | undefined>(
    formState.values.mapping.join(',')
  )

  const changeMapping = (newMappingString: string | undefined): void => {
    setMappingString(newMappingString)
    formState.changeValue('mapping', commaStringToArray(newMappingString))
  }

  const mappingChannels = formState.values.mapping
    .filter(isUnique)
    .filter(channel => channel !== ChannelType.Master)
  const effectiveMasterDependentChannels = mappingChannels.filter(channel =>
    getMasterDependentChannels(formState.values).has(channel)
  )
  const customMasterDependentChannels =
    formState.values.masterDependentChannels !== undefined

  const toggleCustomMasterDependentChannels = (custom: boolean): void => {
    formState.changeValue(
      'masterDependentChannels',
      custom ? effectiveMasterDependentChannels : undefined
    )
  }

  const shapePreview: AdditionalMapShape[] = useDeepEqualMemo([
    {
      x: Math.round(51 - (formState.values.xSize ?? 5) / 2),
      y: Math.round(51 - (formState.values.ySize ?? 5) / 2),
      xSize: formState.values.xSize,
      ySize: formState.values.ySize,
      border: formState.values.border,
      shape: formState.values.shape ?? 'circle',
    },
  ])

  return (
    <>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Fixture Type</h2>
      <TwoColumDialogContainer
        left={
          <>
            <Label
              label="Name"
              input={
                <FormTextInput
                  formState={formState}
                  name="name"
                  fallbackValue=""
                />
              }
            />
            <Label
              label="Mapping"
              description={`Comma-separated - Special values: ${Object.values(
                ChannelType
              ).join(', ')}`}
              input={
                <TextInput value={mappingString} onChange={changeMapping} />
              }
            />
            <Label
              label="Master-dependent channels"
              description={
                customMasterDependentChannels
                  ? undefined
                  : `Default: ${effectiveMasterDependentChannels.join(', ') || 'none'}`
              }
              input={
                <div>
                  <CheckboxLabel
                    value={customMasterDependentChannels}
                    onChange={toggleCustomMasterDependentChannels}
                  >
                    Custom
                  </CheckboxLabel>
                  {customMasterDependentChannels && (
                    <MultiToggleInput
                      value={formState.values.masterDependentChannels ?? []}
                      entries={mappingChannels}
                      onChange={channels =>
                        formState.changeValue(
                          'masterDependentChannels',
                          channels
                        )
                      }
                      entryClassName={inlineToggleEntry}
                    />
                  )}
                </div>
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
              label="Border"
              input={
                <FormSelect
                  entries={fixtureBorderStyleEntries}
                  formState={formState}
                  name="border"
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
                    className={autoWidthInput}
                  />
                  {' x '}
                  <FormNumberInput
                    formState={formState}
                    name="ySize"
                    min={0}
                    max={100}
                    className={autoWidthInput}
                  />
                </>
              }
            />
          </>
        }
        right={<StatelessMapWidget additionalShapes={shapePreview} />}
        rightClassName={editorPreviewColumn}
      />
    </>
  )
}
