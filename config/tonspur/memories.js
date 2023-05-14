const memories = [
  {
    id: '1',
    name: 'Pos',
    scenes: [
      {
        members: ['3_1'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 113,
              tilt: 242,
              w: 0,
              panf: 0,
            },
          },
        ],
      },
      {
        members: ['3_2'],
        states: [
          {
            on: true,
            channels: {
              m: 0,
              r: 0,
              g: 0,
              b: 0,
              pan: 66,
              tilt: 244,
            },
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'W',
    scenes: [
      {
        members: ['group:3'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
              w: 255,
              a: 255,
              l: 255,
            },
          },
        ],
      },
    ],
  },
  {
    id: '22',
    name: '2_AufDas',
    scenes: [
      {
        members: ['group:6'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '3',
    name: '3_HowDeep',
    scenes: [
      {
        members: ['group:6'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 150,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 108,
                b: 177,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '4',
    name: '4_IfIFell',
    scenes: [
      {
        members: ['group:6'],
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
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '5',
    name: '6_AllMy',
    scenes: [
      {
        members: ['group:6'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 87,
              g: 137,
              b: 255,
            },
          },
        ],
      },
    ],
  },
  {
    id: '6',
    name: '7_LivingOn',
    scenes: [
      {
        members: ['group:6'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 255,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 255,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 0,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '7',
    name: '8_EasyOnMe',
    scenes: [
      {
        members: ['group:6'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 0,
                g: 174,
                b: 255,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 81,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 174,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '8',
    name: '9_Because',
    scenes: [
      {
        members: ['group:6'],
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
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 183,
              b: 255,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '9',
    name: '11_YouveGot',
    scenes: [
      {
        members: ['group:6'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 0,
              b: 255,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '10',
    name: '12_BigYellow',
    scenes: [
      {
        members: ['group:6'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 198,
              b: 0,
              prg: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: '11',
    name: '13_Rosanna',
    scenes: [
      {
        members: ['group:6'],
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
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 139,
              b: 255,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '12',
    name: '14_Skyfall',
    scenes: [
      {
        members: ['group:6'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 1,
            },
          },
        ],
      },
    ],
  },
  {
    id: '13',
    name: '16_TinyHoues',
    scenes: [
      {
        members: ['group:2'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 0,
                g: 105,
                b: 255,
              },
            },
            {
              channels: {
                m: 255,
                r: 71,
                g: 255,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 115,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '14',
    name: '18_Abreißen',
    scenes: [
      {
        members: ['group:2'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 101,
              b: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: '15',
    name: '20_Morning',
    scenes: [
      {
        members: ['group:2'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 0,
                g: 224,
                b: 255,
              },
            },
            {
              channels: {
                m: 255,
                r: 0,
                g: 255,
                b: 0,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '16',
    name: '21_Easy',
    scenes: [
      {
        members: ['group:2'],
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
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '17',
    name: '22_Guns',
    scenes: [
      {
        members: ['group:2'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 91,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 194,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 62,
                b: 0,
              },
            },
          ],
        ],
      },
    ],
  },
  {
    id: '18',
    name: '24_Sandler',
    scenes: [
      {
        members: ['group:2'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: '19',
    name: '25_Märchen',
    scenes: [
      {
        members: ['group:2'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 0,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
        ],
        pattern: 'row',
      },
    ],
  },
  {
    id: '20',
    name: '26_WithALittle',
    scenes: [
      {
        members: ['group:2'],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 0,
              g: 213,
              b: 255,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 183,
              g: 255,
              b: 0,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 125,
              b: 218,
            },
          },
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 0,
            },
          },
        ],
        pattern: 'alternate',
      },
    ],
  },
  {
    id: '21',
    name: '27_Proud',
    scenes: [
      {
        members: ['group:2'],
        states: [
          [
            {
              channels: {
                m: 255,
                r: 255,
                g: 0,
                b: 0,
              },
            },
            {
              channels: {
                m: 255,
                r: 255,
                g: 255,
                b: 255,
              },
            },
          ],
        ],
      },
    ],
  },
]

module.exports = memories
