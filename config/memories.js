// @ts-check
/** @type {import('../shared/types/entities').Memory[]} */
const memories = [
  {
    id: 'test',
    name: 'Test',
    scenes: [
      {
        members: ['3x12-#', 'type:flach', 'group:12x12'],
        pattern: 'alternate',
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
          [
            {
              channels: { r: 255 },
            },
            {
              channels: { g: 255 },
            },
            {
              channels: { b: 255 },
            },
          ],
        ],
      },
    ],
  },
]

module.exports = memories
