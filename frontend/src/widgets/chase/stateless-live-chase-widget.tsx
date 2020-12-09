import { IdType, LiveChase } from '@vlight/types'
import { lowestRandomValue, highestRandomValue } from '@vlight/utils'
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
import { getFixtureStateColor } from '../../util/fixtures'

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
  height: ${baseline(8)};
  width: ${baseline(12)};
  margin-bottom: ${baseline()};
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
                  background:
                    getFixtureStateColor({
                      on: true,
                      channels: {
                        m: color.channels.m
                          ? highestRandomValue(color.channels.m)
                          : 255,
                        r: color.channels.r
                          ? highestRandomValue(color.channels.r)
                          : 0,
                        g: color.channels.g
                          ? highestRandomValue(color.channels.g)
                          : 0,
                        b: color.channels.b
                          ? highestRandomValue(color.channels.b)
                          : 0,
                      },
                    }) ?? 'black',
                }}
              />
            ))}
            <Icon
              icon={iconAdd}
              hoverable
              onClick={() =>
                setLiveChaseState(
                  id,
                  {
                    colors: [
                      ...state.colors,
                      { channels: { m: 255, r: 255, g: 255, b: 255 } },
                    ],
                  },
                  true
                )
              }
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
            min={0}
            max={1}
            value={lowestRandomValue(state.light)}
            onChange={from =>
              setLiveChaseState(
                id,
                { light: { from, to: highestRandomValue(state.light) } },
                true
              )
            }
            label="Light min"
          />
          <Fader
            min={0}
            max={1}
            value={highestRandomValue(state.light)}
            onChange={to =>
              setLiveChaseState(
                id,
                { light: { to, from: lowestRandomValue(state.light) } },
                true
              )
            }
            label="Light max"
          />
        </div>
      </Widget>
    )
  }
)
