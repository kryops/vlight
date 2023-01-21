import { IdType } from '@vlight/types'

export function identity<T>(value: T): T {
  return value
}

export function getId<T extends { id: IdType }>(value: T): IdType {
  return value.id
}
