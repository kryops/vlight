import { mdiCheck, mdiClose } from '@mdi/js'

export interface ModalButton<T> {
  icon: string
  label: string
  value: T
}

export const buttonOk: ModalButton<true> = {
  icon: mdiCheck,
  label: 'Ok',
  value: true,
}

export const buttonYes: ModalButton<true> = {
  icon: mdiCheck,
  label: 'Yes',
  value: true,
}

export const buttonNo: ModalButton<false> = {
  icon: mdiClose,
  label: 'No',
  value: false,
}

export const buttonCancel: ModalButton<null> = {
  icon: mdiClose,
  label: 'Cancel',
  value: null,
}

export const yesNo = [buttonYes, buttonNo]
export const okCancel = [buttonOk, buttonCancel]
