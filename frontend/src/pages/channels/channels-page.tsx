import { css } from 'linaria'
import React from 'react'

import { setChannel } from '../../api'
import { getUniverseIndex } from '../../api/util'
import { useApiState } from '../../hooks/api'
import { PureDangerousFader } from '../../ui/controls/fader'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { createRangeArray } from '../../util/array'
import { memoInProduction } from '../../util/development'

const channelsPage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  /* to allow scrolling */
  margin-right: ${baselinePx * 8}px;

  ${flexEndSpacer}
`

const _ChannelsPage: React.SFC = () => {
  const channels = useApiState('channels')

  // TODO add paging / virtual scrolling?
  const allChannels = createRangeArray(1, 512)

  return (
    <div className={channelsPage}>
      {allChannels.map(i => (
        <PureDangerousFader
          key={i}
          value={channels![getUniverseIndex(i)] || 0}
          max={255}
          step={1}
          label={i.toString()}
          onChange={value => setChannel(i, value)}
        />
      ))}
    </div>
  )
}

export default memoInProduction(_ChannelsPage)
