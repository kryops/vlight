import { describe, expect, it, vi } from 'vite-plus/test'

import { mergeObjects } from '@vlight/utils'

import {
  applyStateChange,
  revertStateChange,
  revertStateChanges,
} from '../../src/controls/actions'
import type { StateAdapter } from '../../src/controls/actions/adapters'

vi.mock('../../src/controls/actions/adapters', () => ({}))
vi.mock('../../src/services/masterdata', () => ({
  masterData: {},
  masterDataMaps: {},
}))

interface TestState {
  on: boolean
  speed?: number
  channels: Record<string, number>
}

function createAdapter(initial: Record<string, TestState>) {
  const states = new Map(Object.entries(initial))
  const adapter: StateAdapter<TestState> = {
    name: 'test',
    getIds: () => [...states.keys()],
    get: id => states.get(id),
    set: (id, state, merge) =>
      states.set(
        id,
        merge ? mergeObjects(states.get(id), state) : (state as TestState)
      ),
  }
  return { adapter, states }
}

describe('controls/actions', () => {
  it('applies and reverts partial changes', () => {
    const { adapter, states } = createAdapter({
      a: { on: false, speed: 1, channels: { r: 10, g: 20 } },
    })

    const change = applyStateChange(
      adapter,
      'a',
      { on: true, channels: { r: 255 } },
      true
    )!
    expect(states.get('a')).toEqual({
      on: true,
      speed: 1,
      channels: { r: 255, g: 20 },
    })
    expect(change.paths).toEqual([['on'], ['channels', 'r']])

    // unrelated change in the meantime
    adapter.set('a', { channels: { g: 50 } }, true)

    expect(revertStateChange(change)).toBe(true)
    expect(states.get('a')).toEqual({
      on: false,
      speed: 1,
      channels: { r: 10, g: 50 },
    })
  })

  it('removes values that did not exist before', () => {
    const { adapter, states } = createAdapter({
      a: { on: true, channels: {} },
    })

    const change = applyStateChange(adapter, 'a', { speed: 5 }, true)!
    expect(states.get('a')?.speed).toBe(5)

    revertStateChange(change)
    expect(states.get('a')).toEqual({ on: true, channels: {} })
  })

  it('skips the revert if the changed state was changed in the meantime', () => {
    const { adapter, states } = createAdapter({
      a: { on: false, channels: { r: 10 } },
    })

    const change = applyStateChange(
      adapter,
      'a',
      { on: true, channels: { r: 255 } },
      true
    )!
    adapter.set('a', { channels: { r: 100 } }, true)

    expect(revertStateChange(change)).toBe(false)
    expect(states.get('a')).toEqual({ on: true, channels: { r: 100 } })
  })

  it('reverts complete top-level values in non-partial mode', () => {
    const { adapter, states } = createAdapter({
      a: { on: false, channels: { r: 10, g: 20 } },
    })

    const change = applyStateChange(
      adapter,
      'a',
      { on: true, channels: { b: 255 } },
      false
    )!
    expect(states.get('a')).toEqual({ on: true, channels: { b: 255 } })

    revertStateChange(change)
    expect(states.get('a')).toEqual({ on: false, channels: { r: 10, g: 20 } })
  })

  it('reverts multiple changes of the same value in reverse order', () => {
    const { adapter, states } = createAdapter({
      a: { on: false, channels: {} },
    })

    const changes = [
      applyStateChange(adapter, 'a', { on: true }, true)!,
      applyStateChange(adapter, 'a', { on: false, speed: 2 }, true)!,
    ]
    expect(states.get('a')).toEqual({ on: false, speed: 2, channels: {} })

    revertStateChanges(changes)
    expect(states.get('a')).toEqual({ on: false, channels: {} })
  })

  it('ignores unknown entities', () => {
    const { adapter } = createAdapter({})
    expect(applyStateChange(adapter, 'x', { on: true }, true)).toBeUndefined()
  })
})

describe('controls/actions with changing value types', () => {
  it('reverts an object replacing a primitive value as a whole', () => {
    const { adapter, states } = createAdapter({
      a: { on: true, channels: {}, speed: 1 },
    })
    const change = applyStateChange(
      adapter,
      'a',
      { speed: { from: 1, to: 2 } } as any,
      true
    )!
    expect(change.paths).toEqual([['speed']])

    revertStateChange(change)
    expect(states.get('a')).toEqual({ on: true, channels: {}, speed: 1 })
  })
})
