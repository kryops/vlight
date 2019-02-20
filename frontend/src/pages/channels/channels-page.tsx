import React, { memo, useContext } from 'react'

import { ChannelUniverseContext, sendApiMessage } from '../../api'
import { Fader } from '../../ui/controls/fader'
import { createRangeArray } from '../../util/array'

import styles from './channels-page.scss'

const { x } = styles

const _ChannelsPage: React.SFC = () => {
  const channels = useContext(ChannelUniverseContext)
  if (!channels) {
    return null
  }

  // TODO add paging / virtual scrolling?
  const allChannels = createRangeArray(1, 96)

  return (
    <div className={x}>
      {allChannels.map(i => (
        <Fader
          key={i}
          value={channels![i - 1]}
          max={255}
          step={1}
          label={i.toString()}
          onChange={val => {
            if (val === channels![i - 1]) {
              return
            }
            sendApiMessage({
              type: 'channels',
              channels: { [i]: val },
            })
          }}
        />
      ))}
    </div>
  )
}

export default memo(_ChannelsPage)
