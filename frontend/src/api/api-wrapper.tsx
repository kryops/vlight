import { LoadingScreen } from '../ui/main/loading-screen'
import { useApiConnecting, useMasterData } from '../hooks/api'

/**
 * Wrapper component that renders a loading screen instead of its children
 * while the WebSocket is connecting to the backend.
 */
export function ApiWrapper({ children }: { children: any }) {
  const connecting = useApiConnecting()
  const masterData = useMasterData()

  if (connecting || masterData === undefined) {
    return <LoadingScreen />
  }

  return children
}
