import { ComponentType } from 'react'

import { ApiState } from '../api/worker/processing'

export interface RouteEntry {
  route: string
  page: ComponentType
}

export interface NavItemEntry extends RouteEntry {
  icon: string
  label: string
  /**
   * Determines whether the item should be highlighted based on the current state.
   * (excluding the DMX universe state to avoid frequent re-renders)
   */
  highlighted?: (apiState: ApiState) => boolean
}
