import { describe, expect, it } from 'vite-plus/test'

import { DynamicPage } from '@vlight/types'

import { migrateDynamicPages } from '../../../src/services/masterdata/entities/dynamic-pages'

describe('migrateDynamicPages', () => {
  it('keeps rows in the current format', () => {
    const pages: DynamicPage[] = [
      {
        id: 'foo',
        rows: [{ headline: 'Row', widgets: [{ type: 'map' }] }],
      },
    ]
    expect(migrateDynamicPages(pages)).toEqual(pages)
  })

  it('flattens legacy cells into widgets', () => {
    const pages = [
      {
        id: 'foo',
        name: 'Foo',
        rows: [
          {
            headline: 'Row',
            cells: [
              {
                factor: 2,
                widgets: [{ type: 'dmx-master' }, { type: 'controls' }],
              },
              { widgets: [{ type: 'map' }] },
              { widgets: [] },
            ],
          },
          { cells: [] },
        ],
      },
    ] as unknown as DynamicPage[]

    expect(migrateDynamicPages(pages)).toEqual([
      {
        id: 'foo',
        name: 'Foo',
        rows: [
          {
            headline: 'Row',
            widgets: [
              { type: 'dmx-master' },
              { type: 'controls' },
              { type: 'map' },
            ],
          },
          { widgets: [] },
        ],
      },
    ])
  })

  it('keeps existing widgets before legacy cells', () => {
    const pages: DynamicPage[] = [
      {
        id: 'foo',
        rows: [
          {
            widgets: [{ type: 'map' }],
            cells: [{ widgets: [{ type: 'controls' }] }],
          },
        ],
      },
    ]
    expect(migrateDynamicPages(pages)[0].rows[0]).toEqual({
      widgets: [{ type: 'map' }, { type: 'controls' }],
    })
  })
})
