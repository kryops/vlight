import { MasterData } from '@vlight/entities'
import { useContext } from 'react'

import {
  AppStateContext,
  DmxUniverseContext,
  MasterDataContext,
} from '../api/context'

export const useMasterData = (): MasterData => {
  const masterData = useContext(MasterDataContext)
  if (!masterData) {
    return {
      fixtures: [],
      fixtureTypes: [],
    }
  }
  return masterData
}

export const useDmxUniverse = (): number[] =>
  useContext(DmxUniverseContext) || []

export const useAppState = () => useContext(AppStateContext)
