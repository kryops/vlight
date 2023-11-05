module.exports = {
  "channels": {},
  "fixtures": {
    "1_1": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "1_2": {
      "on": false,
      "channels": {
        "m": 255,
        "foc": 0,
        "str": 0
      }
    },
    "4_1": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "4_2": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "4_3": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "4_4": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "8_1": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "8_2": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "8_3": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "8_4": {
      "on": false,
      "channels": {
        "m": 255
      }
    }
  },
  "fixtureGroups": {
    "4": {
      "on": true,
      "channels": {
        "m": 0,
        "foc": 81
      }
    },
    "7": {
      "on": false,
      "channels": {
        "m": 52,
        "col": 0,
        "gobo": 0,
        "prism": 0,
        "pan": 83,
        "tilt": 186,
        "tiltf": 0,
        "macro": 233
      }
    }
  },
  "memories": {
    "2": {
      "on": false,
      "value": 123,
      "forceMaster": false
    },
    "4": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "6": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "7": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "8": {
      "on": false,
      "value": 255,
      "forceMaster": true
    },
    "10": {
      "on": true,
      "value": 133,
      "forceMaster": true
    },
    "11": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "12": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "13": {
      "on": true,
      "value": 255,
      "forceMaster": true
    },
    "14": {
      "on": false,
      "value": 213,
      "forceMaster": true
    }
  },
  "liveMemories": {
    "1": {
      "members": [
        "group:6"
      ],
      "states": [
        [
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 0,
              "b": 0,
              "pan": 0,
              "tilt": 0
            },
            "mirrored": true
          },
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 255,
              "b": 0,
              "pan": 0,
              "tilt": 0
            },
            "mirrored": true
          }
        ]
      ],
      "value": 255,
      "on": false,
      "name": "Bunt",
      "order": "xcoord",
      "pattern": "alternate"
    },
    "2": {
      "members": [
        "group:6"
      ],
      "states": [
        [
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 0,
              "b": 0
            }
          },
          {
            "channels": {
              "m": 255,
              "r": 255,
              "g": 255,
              "b": 0
            }
          }
        ],
        [
          {
            "channels": {
              "m": 255,
              "r": 0,
              "g": 0,
              "b": 255
            }
          },
          {
            "channels": {
              "m": 255,
              "r": 0,
              "g": 255,
              "b": 0
            }
          }
        ]
      ],
      "value": 255,
      "on": false,
      "name": "Bunt2",
      "order": "members",
      "pattern": "alternate"
    }
  },
  "liveChases": {
    "1": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:6"
      ],
      "light": {
        "from": 0.4293154875437418,
        "to": 0.6959822177886963
      },
      "speed": 0.4485,
      "colors": [
        {
          "channels": {
            "m": 255,
            "r": 255,
            "g": 0,
            "b": 0
          }
        },
        {
          "channels": {
            "m": 255,
            "r": 255,
            "g": 255,
            "b": 255,
            "w": 255
          }
        }
      ],
      "colorsDraft": null,
      "single": false,
      "burst": false,
      "fadeLockedToSpeed": true,
      "name": "Bunt",
      "fade": 0
    },
    "2": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:6",
        "group:7"
      ],
      "light": {
        "from": 0.125,
        "to": 0.36458333333333337
      },
      "speed": 0.04,
      "colors": [
        {
          "channels": {
            "m": 255,
            "r": 255,
            "g": 255,
            "b": 255,
            "w": 255
          }
        }
      ],
      "colorsDraft": null,
      "single": true,
      "burst": false,
      "fadeLockedToSpeed": true,
      "name": "w",
      "fade": 0
    },
    "3": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:7"
      ],
      "light": 1,
      "speed": 0.4425,
      "colors": [
        {
          "channels": {
            "m": 0,
            "r": 0,
            "pan": {
              "from": 48,
              "to": 136
            },
            "tilt": {
              "from": 90,
              "to": 239
            }
          }
        }
      ],
      "colorsDraft": null,
      "single": false,
      "burst": false,
      "fadeLockedToSpeed": true,
      "name": "MP",
      "colorMode": "random",
      "fade": 0
    },
    "4": {
      "on": false,
      "stopped": true,
      "value": 255,
      "members": [
        "group:7"
      ],
      "light": 0.28776041666666663,
      "speed": 0.04,
      "colors": [
        {
          "channels": {
            "m": 255,
            "r": 0,
            "g": 0,
            "b": 0,
            "col": 0
          }
        }
      ],
      "colorsDraft": null,
      "single": false,
      "burst": true,
      "fadeLockedToSpeed": true,
      "name": "Sp",
      "fade": 0
    }
  },
  "dmxMaster": 255,
  "dmxMasterFade": 0
};
