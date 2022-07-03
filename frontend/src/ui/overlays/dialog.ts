import { ReactElement } from 'react'

import { showModal, ModalProps } from './modal'
import { ModalButton, buttonOk } from './buttons'

/**
 * Shows the given content in a dialog, and returns the value of the button that was pressed.
 */
export async function showDialog<T = true>(
  content: string | ReactElement,
  buttons: ModalButton<T>[] = [buttonOk as ModalButton<any>],
  additionalProps: Partial<ModalProps<T>> = {},
  registerCloseHandler?: (fn: (value: T) => void) => void
): Promise<T> {
  return showModal(
    { ...additionalProps, content, buttons },
    registerCloseHandler
  )
}

/**
 * Shows a dialog from the given content factory, allowing the content to change the value
 * and close the dialog.
 *
 * Returns the changed value on success, `undefined` when the dialog was canceled.
 */
export async function showDialogWithReturnValue<T>(
  contentFactory: (
    onChange: (newValue: T) => void,
    close: (success: boolean) => void
  ) => ReactElement,
  buttons: ModalButton<any>[] = [buttonOk as ModalButton<any>],
  additionalProps: Partial<ModalProps<T>> = {}
): Promise<T | undefined> {
  let value: T | undefined = undefined
  let closeHandler: (value: any) => void
  const element = contentFactory(
    (newValue: T) => (value = newValue),
    success => closeHandler?.(success)
  )
  const result = await showDialog(
    element,
    buttons,
    additionalProps,
    newCloseHandler => (closeHandler = newCloseHandler)
  )
  return result ? value : undefined
}
