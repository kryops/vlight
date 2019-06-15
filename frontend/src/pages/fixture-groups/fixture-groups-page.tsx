import { css } from 'linaria'
import React from 'react'

import { useMasterData } from '../../hooks/api'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { FixtureGroupWidget } from '../../widgets/fixture-group'
import { memoInProduction } from '../../util/development'

const fixtureGroupsPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baselinePx}px;
  margin-right: ${baselinePx * 8}px; // to allow scrolling

  ${flexEndSpacer}
`

const _FixtureGroupsPage: React.SFC = () => {
  const { fixtureGroups } = useMasterData()

  return (
    <div className={fixtureGroupsPage}>
      {fixtureGroups.map(group => (
        <FixtureGroupWidget key={group.id} group={group} />
      ))}
    </div>
  )
}

export default memoInProduction(_FixtureGroupsPage)
