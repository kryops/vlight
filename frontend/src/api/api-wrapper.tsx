import { LoadingScreen } from '../ui/main/loading-screen'
import { useApiConnecting, useApiStateSelector } from '../hooks/api'

/**
 * Wrapper component that renders a loading screen instead of its children
 * while the WebSocket is connecting to the backend.
 */
export function ApiWrapper({ children }: { children: any }) {
  const connecting = useApiConnecting()
  const masterDataIsUndefined = useApiStateSelector(
    apiState => apiState.masterData === undefined,
    { event: 'masterData' }
  )

  if (connecting || masterDataIsUndefined) {
    return <LoadingScreen />
  }

  return children
}
