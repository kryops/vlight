import { useState } from 'react'
import { css } from '@linaria/core'
import {
  FixtureBorderStyle,
  FixtureChannelState,
  FixtureShape,
} from '@vlight/types'
import { commaStringToArray, isUnique } from '@vlight/utils'
import {
  ChannelType,
  formatChannelStates,
  getFixtureTypeSegments,
  getMasterDependentChannels,
  parseChannelStates,
} from '@vlight/controls'

import { useFormState } from '../../../../hooks/form'
import {
  FormNumberInput,
  FormSelect,
  FormTextInput,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { TextInput } from '../../../../ui/forms/typed-input'
import {
  Select,
  SelectEntry,
  undefinedSelectEntry,
} from '../../../../ui/forms/select'
import { TextArea } from '../../../../ui/forms/input'
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

const channelStatesContainer = css`
  flex: 1 1 auto;
`

const channelStatesEntry = css`
  margin-bottom: ${baseline(2)};
`

const channelStatesTextArea = css`
  && {
    display: block;
    box-sizing: border-box;
    width: 100%;
    margin-top: ${baseline()};
    resize: vertical;
  }
`

const specialChannelTypes = new Set<string>(Object.values(ChannelType))

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

  const stateChannels = mappingChannels.filter(
    channel => !specialChannelTypes.has(channel)
  )
  const [channelStatesTexts, setChannelStatesTexts] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      Object.entries(formState.values.channelStates ?? {}).map(
        ([channel, states]) => [channel, formatChannelStates(states)]
      )
    )
  )
  const visibleStateChannels = stateChannels.filter(
    channel => channelStatesTexts[channel] !== undefined
  )
  const addableStateChannels = stateChannels.filter(
    channel => channelStatesTexts[channel] === undefined
  )

  const changeChannelStatesText = (channel: string, text: string): void => {
    const newTexts = { ...channelStatesTexts, [channel]: text }
    setChannelStatesTexts(newTexts)

    const channelStates: Record<string, FixtureChannelState[]> = {}
    for (const stateChannel of stateChannels) {
      const states = parseChannelStates(newTexts[stateChannel] ?? '')
      if (states.length) channelStates[stateChannel] = states
    }
    formState.changeValue(
      'channelStates',
      Object.keys(channelStates).length ? channelStates : undefined
    )
  }

  const detectedSegments = getFixtureTypeSegments({
    ...formState.values,
    segments: true,
  })
  const segmentsEnabled =
    !!detectedSegments && formState.values.segments !== false

  const shapePreview: AdditionalMapShape[] = useDeepEqualMemo([
    {
      x: Math.round(51 - (formState.values.xSize ?? 5) / 2),
      y: Math.round(51 - (formState.values.ySize ?? 5) / 2),
      xSize: formState.values.xSize,
      ySize: formState.values.ySize,
      border: formState.values.border,
      shape: formState.values.shape ?? 'circle',
      fixtureType: segmentsEnabled ? formState.values : undefined,
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
            {stateChannels.length > 0 && (
              <Label
                label="Channel states"
                description="One state per line: start value and name, e.g. '8 Red'"
                input={
                  <div className={channelStatesContainer}>
                    {visibleStateChannels.map(channel => (
                      <div key={channel} className={channelStatesEntry}>
                        {channel.toUpperCase()}
                        <TextArea
                          aria-label={`States for channel ${channel}`}
                          value={channelStatesTexts[channel] ?? ''}
                          onChange={text =>
                            changeChannelStatesText(channel, text)
                          }
                          placeholder={'0 Open\n8 Red\n16 Blue'}
                          rows={Math.max(
                            2,
                            (channelStatesTexts[channel] ?? '').split('\n')
                              .length + 1
                          )}
                          className={channelStatesTextArea}
                        />
                      </div>
                    ))}
                    {addableStateChannels.length > 0 && (
                      <Select
                        aria-label="Add channel states"
                        entries={[
                          { ...undefinedSelectEntry, label: 'Add channel…' },
                          ...addableStateChannels,
                        ]}
                        value={undefined}
                        onChange={channel => {
                          if (channel) changeChannelStatesText(channel, '')
                        }}
                      />
                    )}
                  </div>
                }
              />
            )}
            {detectedSegments && (
              <Label
                label="Segments"
                input={
                  <CheckboxLabel
                    value={segmentsEnabled}
                    onChange={value =>
                      formState.changeValue(
                        'segments',
                        value ? undefined : false
                      )
                    }
                  >
                    Split into {detectedSegments.count} segments
                  </CheckboxLabel>
                }
              />
            )}
            {detectedSegments && segmentsEnabled && (
              <Label
                label="Segment columns"
                description="Arrangement on the map (Default: single row, ring for circles)"
                input={
                  <FormNumberInput
                    formState={formState}
                    name="segmentColumns"
                    min={1}
                    max={detectedSegments.count}
                    placeholder={
                      formState.values.shape === 'square'
                        ? String(detectedSegments.count)
                        : 'Ring'
                    }
                  />
                }
              />
            )}
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
