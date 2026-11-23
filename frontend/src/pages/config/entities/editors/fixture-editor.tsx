import { Fixture } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'
import { useRef, useState } from 'react'
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
import {
  findFreeFixtureChannel,
  formatChannelList,
  getOverlappingFixtureChannels,
} from '../../../../util/fixtures'
import { Button } from '../../../../ui/buttons/button'
import { Touchable } from '../../../../ui/components/touchable'
import {
  getFractionWithMargin,
  getTouchEventOffset,
} from '../../../../util/touch'
import { CheckboxLabel } from '../../../../ui/forms/checkbox'

const checkboxLink = css`
  display: block;
  margin-top: ${baseline(2)};
`

const errorMessage = css`
  margin-top: ${baseline(4)};
  color: ${errorShade(0)};
`

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
  const touchRef = useRef<HTMLDivElement>(null)
  const toggleCreateGroup = () =>
    formState.changeValue('createGroup', !formState.values.createGroup)

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
      rotation:
        (formState.values.rotation ?? 0) +
        index * (formState.values.rotationOffset ?? 0),
      originalId: id,
    }))

  const previewFixtures = [
    ...masterData.fixtures.filter(
      fixture => fixture.id !== id && fixture.originalId !== id
    ),
    ...(positionedFixtureEntries || []),
  ]

  const overlappingChannels = getOverlappingFixtureChannels(
    formState.values,
    masterData,
    masterDataMaps
  )
  const showAutoSelect = !id || overlappingChannels.length > 0
  const freeChannel = showAutoSelect
    ? findFreeFixtureChannel(formState.values, masterData, masterDataMaps)
    : undefined

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
                <>
                  <FormNumberInput
                    formState={formState}
                    name="channel"
                    fallbackValue={1}
                    className={showAutoSelect ? autoWidthInput : undefined}
                  />
                  {showAutoSelect && (
                    <Button
                      disabled={
                        freeChannel === undefined || freeChannel === channel
                      }
                      title={
                        freeChannel === undefined
                          ? 'No free channels available'
                          : `Use the first free channel (${freeChannel})`
                      }
                      onClick={() => {
                        if (freeChannel !== undefined) {
                          formState.changeValue('channel', freeChannel)
                        }
                      }}
                    >
                      Auto-Select
                    </Button>
                  )}
                </>
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
            <Label
              label="Rotation"
              input={
                <FormNumberInput
                  formState={formState}
                  name="rotation"
                  min={0}
                  max={360}
                  step={1}
                />
              }
            />
            <h4>Multiple Fixtures</h4>
            <Select
              aria-label="Multiple fixtures mode"
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
            {(count ?? fixturesSharingChannel ?? 1) >= 2 && (
              <Label
                label="Rotation offset"
                input={
                  <FormNumberInput
                    formState={formState}
                    name="rotationOffset"
                    min={0}
                    max={360}
                    step={1}
                  />
                }
              />
            )}
            {!id && (
              <CheckboxLabel
                className={checkboxLink}
                value={formState.values.createGroup}
                onChange={toggleCreateGroup}
              >
                Create group containing the fixture
              </CheckboxLabel>
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
          <Touchable
            onTouch={event => {
              const offset = getTouchEventOffset(event, touchRef)
              if (!offset) {
                return
              }
              const { x, y } = getFractionWithMargin(offset, 4)

              const roundTo100 = (value: number) => Math.round(value * 100)

              formState.changeValue('x', roundTo100(x))
              formState.changeValue('y', roundTo100(y))
            }}
            preventScroll
          >
            <StatelessMapWidget
              ref={touchRef}
              fixtures={previewFixtures}
              highlightedFixtures={
                positionedFixtureEntries
                  ? positionedFixtureEntries.map(it => it.id)
                  : undefined
              }
              displayChannels="highlighted"
            />
          </Touchable>
        }
        rightClassName={editorPreviewColumn}
      />
    </>
  )
}
