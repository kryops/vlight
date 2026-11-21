import { Action } from './action'
import { DbEntity } from './util'

/**
 * An action that is executed when a {@link ProgrammableButton} is pressed.
 */
export type ProgrammableButtonDownAction = Action & {
  /**
   * If set, the changes of this action are reverted when the button is released.
   *
   * Changes are only reverted for the affected entities whose state has not been changed
   * in the meantime.
   *
   * Defaults to `false`.
   */
  revert?: boolean
}

/**
 * Controls when the actions of a {@link ProgrammableButton} are executed:
 * - `flash`: The {@link ProgrammableButton.down} actions are executed when pressing the button,
 *   the {@link ProgrammableButton.up} actions when releasing it.
 * - `toggle`: The {@link ProgrammableButton.down} actions are executed when pressing the button,
 *   the {@link ProgrammableButton.up} actions when pressing it a second time.
 */
export type ProgrammableButtonMode = 'flash' | 'toggle'

/**
 * A button that executes a list of actions when it is pressed and released.
 */
export interface ProgrammableButton extends DbEntity {
  /** The label to display on the button. */
  label?: string

  /**
   * Icon to display on the button.
   *
   * Accepts an identifier from [materialdesignicons.com](https://materialdesignicons.com/)
   * as used in the code, e.g. `mdiAirplaneLanding`.
   *
   * In the master data processing in the backend, the identifier is resolved to its SVG path.
   */
  icon?: string

  /**
   * Keyboard hotkey to press the button with, e.g. `q` or `Shift+a`.
   *
   * It is only active on pages that display the button, and
   * on pages with number hotkeys only while no other widget is selected.
   */
  hotkey?: string

  /**
   * Controls when the actions are executed.
   *
   * Defaults to `flash`.
   */
  mode?: ProgrammableButtonMode

  /** Actions to execute when the button is pressed. */
  down: ProgrammableButtonDownAction[]

  /**
   * Actions to execute when the button is released
   * (or pressed a second time in `toggle` mode).
   *
   * They are executed after reverting the {@link down} actions flagged with
   * {@link ProgrammableButtonDownAction.revert}.
   */
  up: Action[]
}
