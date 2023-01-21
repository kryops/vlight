import { ChannelType } from '@vlight/controls'
import { ChaseColor } from '@vlight/types'
import { highestRandomValue } from '@vlight/utils'

import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { useEvent } from '../../hooks/performance'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  ColorPickerColor,
  colorPickerColors,
} from '../../ui/controls/colorpicker/util'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
import { faderContainer } from '../../ui/css/fader-container'
import { memoInProduction } from '../../util/development'

export interface ChaseColorEditorProps {
  /**
   * Members of the chase as fixture list strings.
   */
  members: string[]

  /**
   * The color to edit.
   */
  color: ChaseColor

  onChange: (newValue: ChaseColor | null) => void
}

/**
 * Component to edit a single chase color.
 */
export const ChaseColorEditor = memoInProduction(
  ({ color, members, onChange }: ChaseColorEditorProps) => {
    const mapping = useCommonFixtureMapping(members)

    const renderFader = (channelType: string, index = 0) => (
      <ValueOrRandomFader
        max={255}
        step={1}
        key={channelType + index}
        label={channelType.toUpperCase()}
        value={color.channels[channelType] ?? 0}
        onChange={newValue =>
          onChange({
            ...color,
            channels: { ...color.channels, [channelType]: newValue },
          })
        }
      />
    )

    const colorPickerCapable = colorPickerColors.every(c => mapping.includes(c))

    const r = highestRandomValue(color.channels[ChannelType.Red] ?? 0)
    const g = highestRandomValue(color.channels[ChannelType.Green] ?? 0)
    const b = highestRandomValue(color.channels[ChannelType.Blue] ?? 0)

    const changeColor = useEvent((colorPickerColor: ColorPickerColor) =>
      onChange({
        ...color,
        channels: { ...color.channels, ...colorPickerColor },
      })
    )

    return (
      <div className={faderContainer}>
        {colorPickerCapable && (
          <ColorPicker r={r} g={g} b={b} onChange={changeColor} />
        )}
        {mapping.map(renderFader)}
      </div>
    )
  }
)
