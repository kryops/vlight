import { css } from '@linaria/core'

import { cx } from '../../util/styles'

import { useSettings } from '../../hooks/settings'
import { MapWidget } from '../../widgets/map/map-widget'
import { fitMapWidth } from '../../widgets/map/map-size'
import { useBreakpoint } from '../hooks/breakpoint'
import { iconFullscreen, iconLight, iconMap, iconRecord } from '../icons'
import { Icon } from '../icons/icon'
import { zCornerOverlay, baseline, errorShade } from '../styles'
import { toggleRecordingBar, useRecordingState } from '../../api/recording'

const cornerOverlay = css`
  position: absolute;
  z-index: ${zCornerOverlay};
  bottom: 0;
  right: 0;
`

const cornerIcon = css`
  padding: ${baseline(2)};
`

const cornerIcon_active = css`
  opacity: 1;
  cursor: default;
`

const miniMapOverlay = css`
  position: absolute;
  z-index: ${zCornerOverlay};
  bottom: 0;
  right: ${baseline(10)};
  width: ${fitMapWidth(baseline(40))};
  min-width: ${fitMapWidth(baseline(40))};
  pointer-events: none;
  opacity: 0.85;
`

function toggleFullScreen() {
  // iOS has the fullscreen API behind a vendor prefix
  if (
    !document.fullscreenElement &&
    !(document as any).webkitFullscreenElement
  ) {
    void document.documentElement.requestFullscreen?.()

    if (!document.documentElement.requestFullscreen) {
      ;(document.documentElement as any).webkitRequestFullscreen?.()
    }
  } else if (document.exitFullscreen) {
    void document.exitFullscreen()
  }
}

/**
 * Overlay in the bottom right corner to display
 * - a toggle for the action recording bar
 * - a minimap and its toggle
 * - a light/dark mode toggle
 */
export const CornerOverlay = () => {
  const { lightMode, miniMap, updateSettings } = useSettings()
  const isLarge = useBreakpoint(600)

  const displayMiniMap = isLarge && miniMap

  const toggleMiniMap = () => updateSettings({ miniMap: !miniMap })
  const toggleLightMode = () => updateSettings({ lightMode: !lightMode })

  const { barVisible, active: recording } = useRecordingState()

  return (
    <>
      <div className={cornerOverlay}>
        <Icon
          title={
            recording ? 'Recording actions' : 'Toggle action recording bar'
          }
          className={cx(cornerIcon, recording && cornerIcon_active)}
          icon={iconRecord}
          color={recording || barVisible ? errorShade(0) : undefined}
          hoverable={!recording}
          onClick={toggleRecordingBar}
        />
        {isLarge && (
          <Icon
            title="Toggle mini map"
            className={cornerIcon}
            icon={iconMap}
            hoverable
            onClick={toggleMiniMap}
          />
        )}
        <Icon
          title="Toggle light mode"
          className={cornerIcon}
          icon={iconLight}
          hoverable
          onClick={toggleLightMode}
        />
        <Icon
          title="Toggle fullscreen"
          className={cornerIcon}
          icon={iconFullscreen}
          hoverable
          onClick={toggleFullScreen}
        />
      </div>
      {displayMiniMap && <MapWidget className={miniMapOverlay} />}
    </>
  )
}
