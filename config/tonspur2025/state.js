module.exports = {
  "channels": {},
  "fixtures": {},
  "fixtureGroups": {
    "1": {
      "on": false,
      "channels": {
        "m": 255
      }
    }
  },
  "memories": {
    "1": {
      "on": false,
      "value": 255,
      "forceMaster": false
    }
  },
  "liveMemories": {
    "1": {
      "members": [
        "group:2"
      ],
      "states": [
        [
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 0,
              "b": 0
            },
            "mirrored": false
          },
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 255,
              "b": 0
            },
            "mirrored": false
          },
          {
            "channels": {
              "m": 255,
              "r": 0,
              "g": 255,
              "b": 0
            },
            "mirrored": false
          },
          {
            "channels": {
              "m": 255,
              "r": 0,
              "g": 0,
              "b": 255
            },
            "mirrored": false
          },
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 0,
              "b": 1
            },
            "mirrored": false
          }
        ]
      ],
      "value": 255,
      "on": false,
      "name": "RGB",
      "order": "members",
      "gradientMovement": false,
      "gradientSpeed": 18.597414227314516,
      "gradientIgnoreFixtureOffset": false,
      "gradientMovementInverted": false
    },
    "2": {
      "members": [
        "group:2"
      ],
      "states": [
        [
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 0,
              "b": 0
            },
            "mirrored": false
          },
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 255,
              "b": 0
            },
            "mirrored": false
          }
        ],
        {
          "on": true,
          "channels": {
            "m": 255,
            "r": 255,
            "g": 255,
            "b": 255
          }
        }
      ],
      "value": 255,
      "on": false,
      "name": "RGB2",
      "order": "members",
      "gradientMovement": false,
      "gradientSpeed": 20.017912242311695,
      "gradientIgnoreFixtureOffset": false,
      "pattern": "alternate",
      "gradientMovementInverted": false
    }
  },
  "liveChases": {
    "1": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:2"
      ],
      "light": {
        "from": 0.5471725463867188,
        "to": 1
      },
      "speed": 1,
      "colors": [
        {
          "channels": {
            "m": 255,
            "r": 0,
            "g": {
              "from": 0,
              "to": 255
            },
            "b": 255
          }
        }
      ],
      "colorsDraft": null,
      "single": true,
      "burst": false,
      "fadeLockedToSpeed": true,
      "name": "RGB",
      "fade": 0.13391730848226174
    },
    "2": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:2",
        "group:1"
      ],
      "light": 0.21502979596455896,
      "speed": 0.03999999999999915,
      "colors": [
        {
          "channels": {
            "m": 255,
            "r": 255,
            "g": 255,
            "b": 255
          }
        }
      ],
      "colorsDraft": null,
      "single": false,
      "burst": false,
      "fadeLockedToSpeed": true,
      "name": "w",
      "fade": 0
    }
  },
  "dmxMaster": 255,
  "dmxMasterFade": 0
};
