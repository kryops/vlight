import { Fixture } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'
import { useState } from 'react'
import { css } from '@linaria/core'

import { useFormState } from '../../../../hooks/form'
import {
  FormTextInput,
  FormNumberInput,
  FormEntityReferenceSelect,
} from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { Label } from '../../../../ui/forms/label'
import { StatelessMapWidget } from '../../../../widgets/map/stateless-map-widget'
import { useMasterDataAndMaps } from '../../../../hooks/api'
import { TwoColumDialogContainer } from '../../../../ui/containers/two-column-dialog'
import {
  autoWidthInput,
  editorPreviewColumn,
  editorTitle,
} from '../../../../ui/css/editor-styles'
import { Select } from '../../../../ui/forms/select'
import { baseline, errorShade } from '../../../../ui/styles'
import { getOccupiedFixtureChannels } from '../../../../util/fixtures'

const errorMessage = css`
  margin-top: ${baseline(4)};
  color: ${errorShade(0)};
`

function formatChannelList(channels: number[]) {
  if (!channels.length) return ''
  if (channels.length === 1) return channels[0]

  let segmentStart: number | undefined
  let lastNumber = -1
  const segments: string[] = []

  const lastChannel = channels[channels.length - 1]

  for (const channel of channels) {
    if (!segmentStart) {
      segmentStart = channel
    } else {
      if (channel !== lastNumber + 1) {
        segments.push(
          lastNumber === segmentStart
            ? String(segmentStart)
            : `${segmentStart} - ${lastNumber}`
        )
        segmentStart = channel
      }
    }

    lastNumber = channel

    if (channel === lastChannel) {
      segments.push(
        lastNumber === segmentStart
          ? String(segmentStart)
          : `${segmentStart} - ${lastNumber}`
      )
    }
  }

  return segments.join(', ')
}

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
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const [sharing, setSharing] = useState(!!entry.fixturesSharingChannel)

  const {
    type,
    x,
    y,
    channel,
    channelOffset,
    xOffset,
    yOffset,
    count,
    fixturesSharingChannel,
  } = formState.values

  const channelsPerFixture =
    masterDataMaps.fixtureTypes.get(type)?.mapping.length ?? 1

  const idSuffixes = createRangeArray(1, count ?? 1)
  const positionedFixtureEntries =
    x !== undefined &&
    y !== undefined &&
    idSuffixes.map<Fixture>((count, index) => ({
      ...formState.values,
      id: `${id}_${count}`,
      channel: channel + index * (channelsPerFixture + (channelOffset ?? 0)),
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

  const occupiedChannels = getOccupiedFixtureChannels(
    formState.values,
    masterDataMaps,
    { isRaw: true }
  )

  const otherFixtures = masterData.fixtures.filter(
    fixture => fixture.id !== id && fixture.originalId !== id
  )
  const otherFixtureChannels = new Set(
    otherFixtures.flatMap(fixture =>
      getOccupiedFixtureChannels(fixture, masterDataMaps)
    )
  )

  const overlappingChannels = occupiedChannels.filter(channel =>
    otherFixtureChannels.has(channel)
  )

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
              input={
                <FormNumberInput
                  formState={formState}
                  name="channel"
                  fallbackValue={1}
                />
              }
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
                  step={1}
                />
              }
            />
            {!sharing && count !== undefined && count >= 2 && (
              <Label
                label="Channel offset"
                input={
                  <FormNumberInput
                    formState={formState}
                    name="channelOffset"
                    min={0}
                    step={1}
                  />
                }
              />
            )}
            {(count ?? fixturesSharingChannel ?? 1) >= 2 && (
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
            )}
            {overlappingChannels.length > 0 && (
              <div className={errorMessage}>
                Channels overlapping with other fixtures:{' '}
                {formatChannelList(overlappingChannels)}
              </div>
            )}
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
            displayChannels="highlighted"
          />
        }
        rightClassName={editorPreviewColumn}
      />
    </>
  )
}
