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
    "2_1": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "2_2": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "3_1": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "3_2": {
      "on": false,
      "channels": {
        "m": 255
      }
    },
    "5_1": {
      "on": false,
      "channels": {
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "5_2": {
      "on": false,
      "channels": {
        "r": 255,
        "g": 255,
        "b": 255,
        "w": 0
      }
    },
    "6_1": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "6_2": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
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
    },
    "9_1": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "9_2": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "7_1": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
      }
    },
    "7_2": {
      "on": false,
      "channels": {
        "m": 255,
        "r": 255,
        "g": 255,
        "b": 255
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
    },
    "8": {
      "on": false,
      "channels": {
        "m": 0,
        "r": 0,
        "g": 0,
        "b": 0,
        "rot": 11,
        "mvspeed": 0,
        "eff": 58,
        "effspeed": 189
      }
    }
  },
  "memories": {
    "1": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "2": {
      "on": false,
      "value": 92,
      "forceMaster": false
    },
    "3": {
      "on": true,
      "value": 41,
      "forceMaster": false
    },
    "4": {
      "on": false,
      "value": 255,
      "forceMaster": false
    },
    "5": {
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
    "9": {
      "on": false,
      "value": 255,
      "forceMaster": true
    },
    "10": {
      "on": true,
      "value": 67,
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
              "b": 0
            },
            "mirrored": true
          }
        ]
      ],
      "value": 197,
      "on": false,
      "name": "Bunt",
      "order": "xcoord",
      "pattern": "alternate"
    }
  },
  "liveChases": {
    "1": {
      "on": true,
      "stopped": true,
      "value": 93,
      "members": [
        "group:6"
      ],
      "light": {
        "from": 0.24999992052714026,
        "to": 0.5972222487131755
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
      "value": 150,
      "members": [
        "group:6",
        "group:3",
        "group:5",
        "group:7",
        "group:8",
        "group:2"
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
        "group:2",
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
      "name": "MV",
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
      "name": "SP",
      "fade": 0
    }
  },
  "dmxMaster": 255,
  "dmxMasterFade": 2.604166666666668
};
