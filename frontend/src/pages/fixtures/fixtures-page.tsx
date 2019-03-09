import { css } from 'linaria'
import React, { memo } from 'react'

import { useMasterData } from '../../hooks/api'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { FixtureWidget } from '../../widgets/fixture'

const fixturesPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baselinePx}px;
  margin-right: ${baselinePx * 8}px; // to allow scrolling

  ${flexEndSpacer}
`

const _FixturesPage: React.SFC = () => {
  const { fixtures } = useMasterData()

  return (
    <div className={fixturesPage}>
      {fixtures.map(fixture => (
        <FixtureWidget key={fixture.id} fixture={fixture} />
      ))}
    </div>
  )
}

export default memo(_FixturesPage)
