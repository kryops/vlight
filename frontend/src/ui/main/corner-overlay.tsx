import { css } from '@linaria/core'

import { useEvent } from '../../hooks/performance'
import { useSettings } from '../../hooks/settings'
import { memoInProduction } from '../../util/development'
import { MapWidget } from '../../widgets/map/map-widget'
import { useBreakpoint } from '../hooks/breakpoint'
import { iconLight, iconMap } from '../icons'
import { Icon } from '../icons/icon'
import { zCornerOverlay, baseline } from '../styles'

const cornerOverlay = css`
  position: absolute;
  z-index: ${zCornerOverlay};
  bottom: 0;
  right: 0;
`

const cornerIcon = css`
  padding: ${baseline(2)};
`

const miniMapOverlay = css`
  position: absolute;
  z-index: ${zCornerOverlay};
  bottom: 0;
  right: ${baseline(10)};
  width: ${baseline(40)};
  min-width: ${baseline(40)};
  pointer-events: none;
  opacity: 0.85;
`

/**
 * Overlay in the bottom right corner to display
 * - a minimap and its toggle
 * - a light/dark mode toggle
 */
export const CornerOverlay = memoInProduction(() => {
  const { lightMode, miniMap, updateSettings } = useSettings()
  const isLarge = useBreakpoint(600)

  const displayMiniMap = isLarge && miniMap

  const toggleMiniMap = useEvent(() => updateSettings({ miniMap: !miniMap }))
  const toggleLightMode = useEvent(() =>
    updateSettings({ lightMode: !lightMode })
  )

  return (
    <>
      <div className={cornerOverlay}>
        {isLarge && (
          <Icon
            className={cornerIcon}
            icon={iconMap}
            hoverable
            onClick={toggleMiniMap}
          />
        )}
        <Icon
          className={cornerIcon}
          icon={iconLight}
          hoverable
          onClick={toggleLightMode}
        />
      </div>
      {displayMiniMap && <MapWidget className={miniMapOverlay} />}
    </>
  )
})
