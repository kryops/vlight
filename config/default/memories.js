// @ts-check
/** @type {import('@vlight/types').Memory[]} */
const memories = [
  {
    id: 'test',
    name: 'Test',
    scenes: [
      {
        members: ['all:3x12', 'type:flach', 'group:12x12'],
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
