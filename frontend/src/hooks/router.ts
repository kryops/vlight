import { useContext, useState } from 'react'

import { RouterContext } from '../util/router-with-context'

export function useRouter() {
  return useContext(RouterContext)
}

export function useRouterLocationChanged() {
  const router = useRouter()
  const [location, setLocation] = useState(router.location)

  const locationChanged = location !== router.location

  if (locationChanged) {
    setLocation(router.location)
  }

  return locationChanged
}
