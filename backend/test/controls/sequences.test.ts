import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  Action,
  Sequence,
  SequenceControl,
  SequenceStepAction,
} from '@vlight/types'

import { getSequenceRunDuration, getSequenceStepTimes } from '@vlight/controls'

import { controlSequence, init } from '../../src/controls/sequences'
import { sequenceStates } from '../../src/controls/sequences/state'

const mocks = vi.hoisted(() => ({
  sequences: new Map<string, Sequence>(),
  applied: [] as string[],
  reverted: [] as string[],
  paused: false,
  pauseHandler: undefined as undefined | ((paused: boolean) => void),
  controlSequence: undefined as
    | undefined
    | ((id: string, control: SequenceControl) => boolean),
}))

vi.mock('../../src/services/masterdata', () => ({
  masterDataMaps: { sequences: mocks.sequences },
}))
vi.mock('../../src/services/http/websocket', () => ({
  broadcastToSockets: vi.fn<() => void>(),
}))
vi.mock('../../src/services/api/registry', () => ({
  registerApiMessageHandler: vi.fn<() => void>(),
}))
vi.mock('../../src/controls/registry', () => ({
  controlRegistry: { register: vi.fn<() => void>() },
}))
vi.mock('../../src/controls/pause', () => ({
  isPaused: () => mocks.paused,
  registerPauseHandler: (handler: (paused: boolean) => void) =>
    (mocks.pauseHandler = handler),
}))
vi.mock('../../src/controls/actions', () => {
  return {
    // channel actions are used as markers: the first channel is the label
    applyAction: (action: Action) => {
      if (action.type === 'sequence') {
        action.ids.forEach(id => mocks.controlSequence!(id, action.control))
        return []
      }
      if (action.type === 'global') {
        mocks.paused = action.control === 'pause'
        mocks.pauseHandler!(mocks.paused)
        return []
      }
      const label = Object.keys((action as any).channels)[0]
      mocks.applied.push(label)
      return [label]
    },
    revertStateChanges: (changes: string[]) =>
      mocks.reverted.push(...[...changes].reverse()),
  }
})

mocks.controlSequence = controlSequence

function setGloballyPaused(paused: boolean) {
  mocks.paused = paused
  mocks.pauseHandler!(paused)
}

function marker(label: string, revert = false): SequenceStepAction {
  return { type: 'channels', channels: { [label]: 255 }, revert }
}

function addSequence(sequence: Omit<Sequence, 'id'>, id = '1') {
  mocks.sequences.set(id, { id, ...sequence })
}

describe('controls/sequences', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'performance'],
    })
    mocks.sequences.clear()
    mocks.applied.length = 0
    mocks.reverted.length = 0
    mocks.paused = false
    init()
  })

  afterEach(() => {
    for (const id of sequenceStates.keys()) controlSequence(id, 'stop')
    vi.useRealTimers()
  })

  it('computes step times and run duration', () => {
    const sequence: Sequence = {
      id: '1',
      steps: [
        { delay: 0.5, actions: [] },
        { delay: 1, actions: [] },
        { delay: 0, actions: [] },
      ],
      endDelay: 2,
    }
    expect(getSequenceStepTimes(sequence)).toEqual([0.5, 1.5, 1.5])
    expect(getSequenceRunDuration(sequence)).toBe(3.5)
  })

  it('executes steps at their times and reverts them at the end of the step', () => {
    addSequence({
      steps: [
        { delay: 0, actions: [marker('a', true)] },
        { delay: 1.5, actions: [marker('b')] },
        { delay: 1, actions: [marker('c', true)] },
      ],
      endDelay: 1,
    })

    controlSequence('1', 'start')
    expect(mocks.applied).toEqual(['a'])
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'running',
      step: 0,
      run: 0,
    })

    vi.advanceTimersByTime(1499)
    expect(mocks.applied).toEqual(['a'])

    vi.advanceTimersByTime(1)
    expect(mocks.applied).toEqual(['a', 'b'])
    expect(mocks.reverted).toEqual(['a'])

    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'b', 'c'])
    expect(mocks.reverted).toEqual(['a'])
    expect(sequenceStates.get('1')?.step).toBe(2)

    // last step is reverted at the end of the run
    vi.advanceTimersByTime(999)
    expect(sequenceStates.has('1')).toBe(true)
    vi.advanceTimersByTime(1)
    expect(mocks.reverted).toEqual(['a', 'c'])
    expect(sequenceStates.has('1')).toBe(false)
  })

  it('pauses and resumes without losing time', () => {
    addSequence({
      steps: [
        { delay: 1, actions: [marker('a')] },
        { delay: 1, actions: [marker('b')] },
      ],
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1500)
    expect(mocks.applied).toEqual(['a'])

    controlSequence('1', 'pause')
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'paused',
      time: 1.5,
    })
    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual(['a'])

    controlSequence('1', 'start')
    vi.advanceTimersByTime(499)
    expect(mocks.applied).toEqual(['a'])
    vi.advanceTimersByTime(1)
    expect(mocks.applied).toEqual(['a', 'b'])
  })

  it('toggles between running and paused', () => {
    addSequence({ steps: [{ delay: 10, actions: [] }] })

    controlSequence('1', 'toggle')
    expect(sequenceStates.get('1')?.status).toBe('running')
    controlSequence('1', 'toggle')
    expect(sequenceStates.get('1')?.status).toBe('paused')
    controlSequence('1', 'toggle')
    expect(sequenceStates.get('1')?.status).toBe('running')
  })

  it('reverts the current step when stopped', () => {
    addSequence({
      steps: [
        { delay: 0, actions: [marker('a', true), marker('b')] },
        { delay: 1, actions: [] },
      ],
    })

    controlSequence('1', 'start')
    controlSequence('1', 'pause')
    controlSequence('1', 'stop')
    expect(mocks.reverted).toEqual(['a'])
    expect(sequenceStates.has('1')).toBe(false)

    // starts from the beginning again
    controlSequence('1', 'start')
    expect(mocks.applied).toEqual(['a', 'b', 'a', 'b'])
  })

  it('repeats a sequence n times', () => {
    addSequence({
      steps: [{ delay: 0, actions: [marker('a')] }],
      repeat: 2,
      endDelay: 1,
    })

    controlSequence('1', 'start')
    expect(mocks.applied).toEqual(['a'])
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'a'])
    expect(sequenceStates.get('1')?.run).toBe(1)
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'a', 'a'])
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'a', 'a'])
    expect(sequenceStates.has('1')).toBe(false)
  })

  it('repeats a sequence infinitely', () => {
    addSequence({
      steps: [{ delay: 1, actions: [marker('a')] }],
      repeat: 'infinite',
      endDelay: 0,
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(10_000)
    expect(mocks.applied).toHaveLength(10)
    expect(sequenceStates.get('1')?.run).toBe(10)
  })

  it('does not loop endlessly for repeating sequences without delays', () => {
    addSequence({
      steps: [{ delay: 0, actions: [marker('a')] }],
      repeat: 'infinite',
      endDelay: 0,
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toHaveLength(11)
  })

  it('can pause and stop itself', () => {
    addSequence({
      steps: [
        {
          delay: 1,
          actions: [{ type: 'sequence', ids: ['1'], control: 'pause' }],
        },
        {
          delay: 1,
          actions: [
            marker('a', true),
            { type: 'sequence', ids: ['1'], control: 'stop' },
            marker('b', true),
          ],
        },
        { delay: 1, actions: [marker('c')] },
      ],
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(5000)
    expect(sequenceStates.get('1')).toMatchObject({ status: 'paused', step: 0 })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    // reverted immediately as the sequence was stopped
    expect(mocks.applied).toEqual(['a', 'b'])
    expect(mocks.reverted).toEqual(['b', 'a'])
    expect(sequenceStates.has('1')).toBe(false)

    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual(['a', 'b'])
  })

  it('starts other sequences and stops endless recursion', () => {
    addSequence(
      {
        steps: [
          {
            delay: 0,
            actions: [
              marker('a'),
              { type: 'sequence', ids: ['1'], control: 'restart' },
            ],
          },
        ],
      },
      '1'
    )
    addSequence(
      {
        steps: [
          {
            delay: 0,
            actions: [{ type: 'sequence', ids: ['1'], control: 'start' }],
          },
        ],
        endDelay: 1,
      },
      '2'
    )

    controlSequence('2', 'start')
    expect(sequenceStates.has('2')).toBe(true)
    expect(mocks.applied.length).toBeGreaterThan(1)
    expect(mocks.applied.length).toBeLessThanOrEqual(25)
  })

  it('waits for manual steps', () => {
    addSequence({
      steps: [
        { delay: 1, actions: [marker('a')] },
        { actions: [marker('b')] },
        { delay: 1, actions: [marker('c')] },
      ],
      endDelay: 0,
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(10_000)
    expect(mocks.applied).toEqual(['a'])
    // the time does not advance while waiting
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'running',
      step: 0,
      time: 1,
    })

    controlSequence('1', 'next')
    expect(mocks.applied).toEqual(['a', 'b'])
    expect(sequenceStates.get('1')).toMatchObject({ step: 1, time: 1 })

    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'b', 'c'])
    expect(sequenceStates.has('1')).toBe(false)
  })

  it('skips to the next step while running', () => {
    addSequence({
      steps: [
        { delay: 0, actions: [marker('a', true)] },
        { delay: 5, actions: [marker('b')] },
        { delay: 2, actions: [marker('c')] },
      ],
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    controlSequence('1', 'next')
    expect(mocks.applied).toEqual(['a', 'b'])
    expect(mocks.reverted).toEqual(['a'])
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'running',
      time: 5,
    })

    // the following delays are relative to the skipped step
    vi.advanceTimersByTime(1999)
    expect(mocks.applied).toEqual(['a', 'b'])
    vi.advanceTimersByTime(1)
    expect(mocks.applied).toEqual(['a', 'b', 'c'])
  })

  it('executes the next step of stopped and paused sequences, staying paused', () => {
    addSequence({
      steps: [
        { delay: 1, actions: [marker('a')] },
        { delay: 1, actions: [marker('b')] },
      ],
    })

    controlSequence('1', 'next')
    expect(mocks.applied).toEqual(['a'])
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'paused',
      step: 0,
      time: 1,
    })
    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual(['a'])

    controlSequence('1', 'next')
    expect(mocks.applied).toEqual(['a', 'b'])
    expect(sequenceStates.get('1')).toMatchObject({ status: 'paused', step: 1 })

    // after the last step, the run ends
    controlSequence('1', 'next')
    expect(sequenceStates.has('1')).toBe(false)
  })

  it('starts the next run when skipping after the last step of a repeating sequence', () => {
    addSequence({
      steps: [{ delay: 1, actions: [marker('a')] }],
      repeat: 1,
      endDelay: 10,
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    controlSequence('1', 'next')
    expect(sequenceStates.get('1')).toMatchObject({ run: 1, step: -1 })
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'a'])
  })

  it('freezes running sequences while globally paused', () => {
    addSequence({
      steps: [
        { delay: 1, actions: [marker('a')] },
        { delay: 1, actions: [marker('b')] },
      ],
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1500)
    setGloballyPaused(true)
    expect(sequenceStates.get('1')).toMatchObject({
      status: 'running',
      time: 1.5,
    })

    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual(['a'])
    expect(sequenceStates.get('1')?.time).toBe(1.5)

    setGloballyPaused(false)
    vi.advanceTimersByTime(499)
    expect(mocks.applied).toEqual(['a'])
    vi.advanceTimersByTime(1)
    expect(mocks.applied).toEqual(['a', 'b'])
  })

  it('does not advance sequences started while globally paused', () => {
    addSequence({ steps: [{ delay: 1, actions: [marker('a')] }] })
    setGloballyPaused(true)

    controlSequence('1', 'start')
    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual([])

    // manually paused sequences stay paused when resuming globally
    controlSequence('1', 'pause')
    setGloballyPaused(false)
    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual([])

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a'])
  })

  it('pauses itself via a global pause action of a step', () => {
    addSequence({
      steps: [
        {
          delay: 1,
          actions: [marker('a'), { type: 'global', control: 'pause' }],
        },
        { delay: 1, actions: [marker('b')] },
      ],
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a'])
    expect(sequenceStates.get('1')).toMatchObject({ step: 0, time: 1 })

    vi.advanceTimersByTime(5000)
    expect(mocks.applied).toEqual(['a'])

    setGloballyPaused(false)
    vi.advanceTimersByTime(999)
    expect(mocks.applied).toEqual(['a'])
    vi.advanceTimersByTime(1)
    expect(mocks.applied).toEqual(['a', 'b'])
  })

  it('waits for a manual end of the run without end delay', () => {
    addSequence({
      steps: [{ delay: 1, actions: [marker('a', true)] }],
      repeat: 1,
    })

    controlSequence('1', 'start')
    vi.advanceTimersByTime(10_000)
    expect(mocks.applied).toEqual(['a'])
    expect(mocks.reverted).toEqual([])
    expect(sequenceStates.get('1')).toMatchObject({ run: 0, step: 0, time: 1 })

    controlSequence('1', 'next')
    expect(mocks.reverted).toEqual(['a'])
    expect(sequenceStates.get('1')).toMatchObject({ run: 1, step: -1 })

    vi.advanceTimersByTime(1000)
    expect(mocks.applied).toEqual(['a', 'a'])
    vi.advanceTimersByTime(10_000)
    expect(sequenceStates.has('1')).toBe(true)

    controlSequence('1', 'next')
    expect(sequenceStates.has('1')).toBe(false)
  })
})
