const buttons = [
  {
    id: '1',
    label: 'Red Pars',
    down: [
      {
        type: 'memory',
        ids: ['1'],
        state: { on: true },
        partial: true,
        revert: true,
      },
    ],
    up: [],
  },
]

module.exports = buttons
