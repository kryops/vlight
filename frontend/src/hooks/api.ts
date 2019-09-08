import { MasterData } from '@vlight/entities'
import { useContext } from 'react'

import {
  AppStateContext,
  DmxUniverseContext,
  MasterDataContext,
} from '../api/context'
import { masterDataMaps } from '../api/masterdata'

export const useMasterData = (): MasterData => {
  const masterData = useContext(MasterDataContext)
  if (!masterData) {
    return {
      fixtures: [],
      fixtureTypes: [],
      fixtureGroups: [],
      memories: [],
      dynamicPages: [],
    }
  }
  return masterData
}

export const useMasterDataMaps = () => {
  // refresh the component when the master data changes
  useMasterData()
  return masterDataMaps
}

export const useDmxUniverse = (): number[] =>
  useContext(DmxUniverseContext) || []

export const useAppState = () => useContext(AppStateContext)
