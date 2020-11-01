import { ListRegistry } from '../util/registry'

export interface Control {
  reload: (reloadState?: boolean) => void | Promise<void>
}

export const controlRegistry = new ListRegistry<Control>()
