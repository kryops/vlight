import { ListRegistry } from '../util/registry'

/**
 * Common interface that represents a certain type of control (e.g. a memory) within the backend.
 */
export interface Control {
  /**
   * Reloads the control.
   * Usually called after master data changes.
   *
   * @param reloadState - if set, the controls should also reload their state from the
   *   persisted one, which may have been reset.
   */
  reload: (reloadState?: boolean) => void | Promise<void>
}

/**
 * Registry of all controls.
 * Each control should register here in its `init` function.
 */
export const controlRegistry = new ListRegistry<Control>()
