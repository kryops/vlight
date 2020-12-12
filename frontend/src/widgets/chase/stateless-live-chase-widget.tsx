import { ChaseColor, IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'

import { setLiveChaseState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader/fader'
import { faderContainer } from '../../ui/css/fader-container'
import { flexWrap } from '../../ui/css/flex'
import { FixtureListInput } from '../../ui/forms/fixture-list-input'
import { iconAdd } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { showDialogWithReturnValue } from '../../ui/overlays/dialog'
import { okCancel } from '../../ui/overlays/buttons'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'

import { getChasePreviewColor } from './utils'
import { ChaseColorEditor } from './chase-color-editor'

const leftColumn = css`
  flex: 1 1 auto;
  padding-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const colorContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const colorStyle = css`
  flex: 1 1 auto;
  height: ${baseline(8)};
  width: ${baseline(12)};
  margin-bottom: ${baseline()};
  cursor: pointer;
`

export interface StatelessLiveChaseWidgetProps {
  id: IdType
  state: LiveChase
  title?: string
}

export const StatelessLiveChaseWidget = memoInProduction(
  ({ id, state, title }: StatelessLiveChaseWidgetProps) => {
    return (
      <Widget
        title={title}
        onTitleClick={() => setLiveChaseState(id, { on: !state.on }, true)}
        turnedOn={state.on}
        contentClassName={flexWrap}
      >
        <div className={leftColumn}>
          <FixtureListInput
            value={state.members}
            onChange={members => setLiveChaseState(id, { members }, true)}
            ordering
            compact
          />
        </div>
        <div className={faderContainer}>
          <div className={colorContainer}>
            {state.colors.map((color, index) => (
              <div
                key={index}
                className={colorStyle}
                style={{
                  background: getChasePreviewColor(color),
                }}
                onClick={async () => {
                  const result = await showDialogWithReturnValue<ChaseColor | null>(
                    (onChange, onClose) => (
                      <ChaseColorEditor
                        members={state.members}
                        color={color}
                        onChange={onChange}
                        onClose={onClose}
                      />
                    ),
                    okCancel,
                    { showCloseButton: true }
                  )
                  if (result === undefined) return

                  if (result === null)
                    setLiveChaseState(
                      id,
                      { colors: state.colors.filter(it => it !== color) },
                      true
                    )
                  else
                    setLiveChaseState(
                      id,
                      {
                        colors: state.colors.map(it =>
                          it === color ? result : it
                        ),
                      },
                      true
                    )
                }}
              />
            ))}
            <Icon
              icon={iconAdd}
              hoverable
              onClick={async () => {
                const result = await showDialogWithReturnValue<ChaseColor | null>(
                  onChange => (
                    <ChaseColorEditor
                      members={state.members}
                      onChange={onChange}
                    />
                  ),
                  okCancel,
                  { showCloseButton: true }
                )
                if (!result) return
                setLiveChaseState(
                  id,
                  { colors: [...state.colors, result] },
                  true
                )
              }}
            />
          </div>
          <Fader
            max={255}
            step={1}
            value={state.value ?? 0}
            onChange={value => setLiveChaseState(id, { value }, true)}
            label="Value"
          />
          <Fader
            min={5}
            max={0.025}
            value={state.speed}
            onChange={speed => setLiveChaseState(id, { speed }, true)}
            label="Speed"
            subLabel={`${state.speed.toFixed(2)}s`}
          />
          <Fader
            min={5}
            max={0}
            value={state.fade ?? 0}
            onChange={fade => setLiveChaseState(id, { fade }, true)}
            label="Fade"
            subLabel={state.fade ? `${state.fade.toFixed(2)}s` : 'Instant'}
          />
          <ValueOrRandomFader
            min={0}
            max={1}
            value={state.light}
            onChange={light => setLiveChaseState(id, { light }, true)}
            label="Light"
          />
        </div>
      </Widget>
    )
  }
)
