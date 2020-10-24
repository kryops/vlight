import { LoadingScreen } from '../ui/main/loading-screen'
import { useApiConnecting, useMasterData } from '../hooks/api'

export function ApiWrapper({ children }: { children: any }) {
  const connecting = useApiConnecting()
  const masterData = useMasterData()

  if (connecting || masterData === undefined) {
    return <LoadingScreen />
  }

  return children
}
