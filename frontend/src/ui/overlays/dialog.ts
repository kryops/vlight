import { ReactElement } from 'react'

import { showModal, ModalProps } from './modal'
import { ModalButton, buttonOk } from './buttons'

export async function showDialog<T = true>(
  content: string | ReactElement,
  buttons: ModalButton<T>[] = [buttonOk as ModalButton<any>],
  additionalProps: Partial<ModalProps<T>> = {}
): Promise<T> {
  return showModal({ ...additionalProps, content, buttons })
}

export async function showDialogWithReturnValue<T>(
  contentFactory: (onChange: (newValue: T) => void) => ReactElement,
  buttons: ModalButton<any>[] = [buttonOk as ModalButton<any>],
  additionalProps: Partial<ModalProps<T>> = {}
): Promise<T | undefined> {
  let value: T | undefined = undefined
  const element = contentFactory((newValue: T) => (value = newValue))
  const result = await showDialog(element, buttons, additionalProps)
  return result ? value : undefined
}
