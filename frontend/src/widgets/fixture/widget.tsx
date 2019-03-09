import { Fixture, FixtureState, FixtureType } from '@vlight/entities'
import { css } from 'linaria'
import React, { memo } from 'react'

import { changeFixtureState } from '../../api'
import { Widget } from '../../ui/containers/widget'
import { Fader } from '../../ui/controls/fader'
import { baselinePx } from '../../ui/styles'

export function getFixtureName(
  fixture: Fixture,
  fixtureType: FixtureType
): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }
  return `${fixture.channel} ${fixtureType.name}`
}

const turnedOff = css`
  opacity: 0.2;
`

const faderContainer = css`
  display: flex;
  justify-content: center;
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: ${baselinePx * 8}px; // horizontal scrolling
`

interface StatelessProps {
  fixture: Fixture
  fixtureType: FixtureType
  fixtureState: FixtureState
}

const _StatelessFixtureWidget: React.SFC<StatelessProps> = ({
  fixture,
  fixtureType,
  fixtureState,
}) => {
  return (
    <Widget
      key={fixture.id}
      title={
        <a
          onClick={() =>
            changeFixtureState(fixture.id, fixtureState, {
              on: !fixtureState.on,
            })
          }
        >
          {getFixtureName(fixture, fixtureType)} {!fixtureState.on && '[OFF]'}
        </a>
      }
      className={fixtureState.on ? undefined : turnedOff}
    >
      <div className={faderContainer}>
        {fixtureType.mapping.map(channelType => (
          <Fader
            key={channelType}
            max={255}
            step={1}
            label={channelType.toUpperCase()}
            value={fixtureState.channels[channelType] || 0}
            onChange={value =>
              changeFixtureState(fixture.id, fixtureState, {
                channels: {
                  [channelType]: value,
                },
              })
            }
          />
        ))}
      </div>
    </Widget>
  )
}

export const StatelessFixtureWidget = memo(_StatelessFixtureWidget)
