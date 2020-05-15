import { ListRegistry } from '../util/registry'

export interface Control {
  reload: () => void | Promise<void>
}

export const controlRegistry = new ListRegistry<Control>()
