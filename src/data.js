export const DASHBOARD_DATA = {
  "project": {
    "title": "Delivery Planning Dashboard based on Urban Mobility Proxy Data",
    "subtitle": "Data-Driven Last-Mile Delivery Optimization",
    "primaryMetric": "predicted_travel_time_minutes",
    "fleetSize": 5,
    "clusters": 6,
    "validTrips": 195990,
    "trainRows": 156792,
    "testRows": 39198
  },
  "scenarios": {
    "100": {
      "orders": 100,
      "modelMetrics": {
        "maeMin": 2.83,
        "rmseMin": 4.632,
        "r2": 0.82
      },
      "routing": {
        "distance_vrp": {
          "label": "Distance VRP",
          "totalCostMin": 764,
          "maxRouteMin": 167,
          "avgRouteMin": 152.8,
          "routeCostStd": 14.797,
          "activeVehicles": 5,
          "activeVehicleRatio": 1.0,
          "customerBalanceCv": 0.164,
          "costBalanceCv": 0.097
        },
        "predicted_time_vrp": {
          "label": "Predicted-time VRP",
          "totalCostMin": 706,
          "maxRouteMin": 145,
          "avgRouteMin": 141.2,
          "routeCostStd": 6.645,
          "activeVehicles": 5,
          "activeVehicleRatio": 1.0,
          "customerBalanceCv": 0.122,
          "costBalanceCv": 0.047
        },
        "random_baseline": {
          "label": "Random baseline",
          "totalCostMin": 1469,
          "maxRouteMin": 317,
          "avgRouteMin": 293.8,
          "routeCostStd": 15.237,
          "activeVehicles": 5,
          "activeVehicleRatio": 1.0,
          "customerBalanceCv": 0.0,
          "costBalanceCv": 0.052
        }
      },
      "improvementPct": {
        "distanceVsRandom": 47.99,
        "predictedVsRandom": 51.94,
        "predictedVsDistance": 7.59
      },
      "bestScenario": {
        "label": "Predicted-time VRP",
        "totalCostMin": 706,
        "activeVehicles": 5,
        "activeVehicleRatio": 1.0,
        "customerBalanceCv": 0.122,
        "costBalanceCv": 0.047
      },
      "bestScenarioDetail": {
        "routeLengthList": [
          24,
          21,
          18,
          20,
          17
        ],
        "vehicleCustomerCounts": [
          24,
          21,
          18,
          20,
          17
        ],
        "vehicleCosts": [
          145,
          145,
          128,
          143,
          145
        ]
      }
    },
    "200": {
      "orders": 200,
      "modelMetrics": {
        "maeMin": 2.83,
        "rmseMin": 4.632,
        "r2": 0.82
      },
      "routing": {
        "distance_vrp": {
          "label": "Distance VRP",
          "totalCostMin": 1457,
          "maxRouteMin": 384,
          "avgRouteMin": 291.4,
          "routeCostStd": 146.688,
          "activeVehicles": 4,
          "activeVehicleRatio": 0.8,
          "customerBalanceCv": 0.073,
          "costBalanceCv": 0.052
        },
        "predicted_time_vrp": {
          "label": "Predicted-time VRP",
          "totalCostMin": 1398,
          "maxRouteMin": 350,
          "avgRouteMin": 279.6,
          "routeCostStd": 139.801,
          "activeVehicles": 4,
          "activeVehicleRatio": 0.8,
          "customerBalanceCv": 0.139,
          "costBalanceCv": 0.001
        },
        "random_baseline": {
          "label": "Random baseline",
          "totalCostMin": 3137,
          "maxRouteMin": 668,
          "avgRouteMin": 627.4,
          "routeCostStd": 33.88,
          "activeVehicles": 5,
          "activeVehicleRatio": 1.0,
          "customerBalanceCv": 0.0,
          "costBalanceCv": 0.054
        }
      },
      "improvementPct": {
        "distanceVsRandom": 53.55,
        "predictedVsRandom": 55.44,
        "predictedVsDistance": 4.05
      },
      "bestScenario": {
        "label": "Predicted-time VRP",
        "totalCostMin": 1398,
        "activeVehicles": 4,
        "activeVehicleRatio": 0.8,
        "customerBalanceCv": 0.139,
        "costBalanceCv": 0.001
      },
      "bestScenarioDetail": {
        "routeLengthList": [
          0,
          38,
          54,
          54,
          54
        ],
        "vehicleCustomerCounts": [
          0,
          38,
          54,
          54,
          54
        ],
        "vehicleCosts": [
          0,
          350,
          350,
          349,
          349
        ]
      }
    },
    "1000": {
      "orders": 1000,
      "modelMetrics": {
        "maeMin": 2.83,
        "rmseMin": 4.632,
        "r2": 0.82
      },
      "routing": {
        "distance_vrp": {
          "label": "Distance VRP",
          "totalCostMin": 6325,
          "maxRouteMin": 1928,
          "avgRouteMin": 1265.0,
          "routeCostStd": 659.139,
          "activeVehicles": 4,
          "activeVehicleRatio": 0.8,
          "customerBalanceCv": 0.139,
          "costBalanceCv": 0.131
        },
        "predicted_time_vrp": {
          "label": "Predicted-time VRP",
          "totalCostMin": 6169,
          "maxRouteMin": 2030,
          "avgRouteMin": 1233.8,
          "routeCostStd": 670.531,
          "activeVehicles": 4,
          "activeVehicleRatio": 0.8,
          "customerBalanceCv": 0.136,
          "costBalanceCv": 0.19
        },
        "random_baseline": {
          "label": "Random baseline",
          "totalCostMin": 15679,
          "maxRouteMin": 3240,
          "avgRouteMin": 3135.8,
          "routeCostStd": 87.255,
          "activeVehicles": 5,
          "activeVehicleRatio": 1.0,
          "customerBalanceCv": 0.0,
          "costBalanceCv": 0.028
        }
      },
      "improvementPct": {
        "distanceVsRandom": 59.66,
        "predictedVsRandom": 60.65,
        "predictedVsDistance": 2.47
      },
      "bestScenario": {
        "label": "Predicted-time VRP",
        "totalCostMin": 6169,
        "activeVehicles": 4,
        "activeVehicleRatio": 0.8,
        "customerBalanceCv": 0.136,
        "costBalanceCv": 0.19
      },
      "bestScenarioDetail": {
        "routeLengthList": [
          0,
          191,
          270,
          269,
          270
        ],
        "vehicleCustomerCounts": [
          0,
          191,
          270,
          269,
          270
        ],
        "vehicleCosts": [
          0,
          2030,
          1484,
          1404,
          1251
        ]
      }
    }
  }
};
