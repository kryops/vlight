import { mergeObjects } from '../src'

describe('mergeObjects', () => {
  it('deep-merges objects', () => {
    expect(
      mergeObjects(
        {
          foo: 'bar',
          bar: 'baz',
          arr: ['ay'],
          nested: {
            ob: 'ject',
            ag: {
              ai: 'n',
            },
          },
        },
        {
          foo: 'baz',
          arr: ['ayy'],
          nested: {
            ag: {
              new: 'prop2',
            },
          },
          new: 'prop',
        }
      )
    ).toEqual({
      foo: 'baz',
      bar: 'baz',
      arr: ['ayy'],
      nested: {
        ob: 'ject',
        ag: {
          ai: 'n',
          new: 'prop2',
        },
      },
      new: 'prop',
    })
  })
})
