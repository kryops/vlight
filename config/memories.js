// @ts-check
/** @type {import('../shared/types/entities').Memory[]} */
const memories = [
  {
    id: 'test',
    name: 'Test',
    scenes: [
      {
        members: ['stufe1', '3x12-#', 'type:flach', 'group:12x12'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
            },
          },
        ],
      },
    ],
  },
]

module.exports = memories
