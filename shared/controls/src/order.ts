import { Fixture, FixtureOrder } from '@vlight/types'
import { assertNever } from '@vlight/utils'

/**
 * Returns whether the given order sorts fixtures by their coordinates
 * (as opposed to their position in the member list).
 */
export function isOrderedByCoords(order: FixtureOrder | undefined): boolean {
  return order !== undefined && order !== 'members'
}

/**
 * Returns the value to sort the given fixture by for the given order.
 */
export function getOrderValue(
  fixture: Fixture,
  order: FixtureOrder | undefined
): number {
  switch (order) {
    case undefined:
    case 'members':
      return 0 // this should mostly be irrelevant
    case 'xcoord':
      return fixture.x ?? 0
    case 'ycoord':
      return fixture.y ?? 0
    case 'x+y':
      return (fixture.x ?? 0) + (fixture.y ?? 0)
    case 'x-y':
      return (fixture.x ?? 0) - (fixture.y ?? 0)
    default:
      assertNever(order)
      return 0
  }
}

/**
 * Returns the given fixtures sorted by the given order.
 *
 * For the `members` order, the original array is returned.
 */
export function orderFixtures(
  fixtures: Fixture[],
  order: FixtureOrder | undefined
): Fixture[] {
  return !isOrderedByCoords(order)
    ? fixtures
    : [...fixtures].sort(
        (a, b) => getOrderValue(a, order) - getOrderValue(b, order)
      )
}
