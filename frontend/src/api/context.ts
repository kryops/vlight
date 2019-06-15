import { Dictionary, FixtureState, MasterData } from '@vlight/entities'
import React from 'react'

export interface AppState {
  channels: number[]
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
}

export const MasterDataContext = React.createContext<MasterData | undefined>(
  undefined
)

export const DmxUniverseContext = React.createContext<number[] | undefined>(
  undefined
)

export const AppStateContext = React.createContext<AppState>({
  channels: [],
  fixtures: {},
  fixtureGroups: {},
})
