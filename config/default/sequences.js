const sequences = [
  {
    id: '1',
    name: 'New Sequence',
    steps: [
      {
        delay: 0,
        actions: [
          {
            type: 'memory',
            ids: ['test'],
            state: {
              on: true,
            },
            partial: true,
            revert: true,
          },
        ],
      },
      {
        delay: 1,
        actions: [
          {
            type: 'memory',
            ids: ['1'],
            state: {
              on: true,
            },
            partial: true,
            revert: true,
          },
        ],
      },
    ],
    repeat: 'infinite',
    endDelay: 2,
  },
]

module.exports = sequences
