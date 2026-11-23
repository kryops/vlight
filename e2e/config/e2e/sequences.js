const sequences = [
  {
    id: '1',
    name: 'Memory Sequence',
    steps: [
      {
        delay: 0,
        actions: [
          {
            type: 'memory',
            ids: ['1'],
            state: { on: true },
            partial: true,
            revert: true,
          },
        ],
      },
    ],
    repeat: 'infinite',
    endDelay: 1,
  },
]

module.exports = sequences
