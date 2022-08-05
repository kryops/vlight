import { ReactElement, useState } from 'react'

import { Label } from '../forms/label'
import { TextInput } from '../forms/typed-input'

import { showModal, ModalProps } from './modal'
import { ModalButton, buttonOk, okCancel } from './buttons'

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

/**
 * Shows a simple dialog that prompts for a string value.
 *
 * Returns the value on success, `undefined` if the dialog was canceled
 * or nothing was entered.
 */
export async function showPromptDialog(label: string, initialValue?: string) {
  const FormComponent = ({
    onChange,
    close,
  }: {
    onChange: (newValue: string | undefined) => void
    close: (success: boolean) => void
  }) => {
    const [value, setValue] = useState<string | undefined>(initialValue)
    return (
      <Label
        label={label}
        input={
          <TextInput
            value={value}
            onChange={newValue => {
              setValue(newValue)
              onChange(newValue)
            }}
            autoFocus
            onKeyDown={event => {
              if (event.key === 'Enter') close(true)
            }}
          />
        }
      />
    )
  }

  return showDialogWithReturnValue<string | undefined>(
    (onChange, close) => <FormComponent onChange={onChange} close={close} />,
    okCancel
  )
}
