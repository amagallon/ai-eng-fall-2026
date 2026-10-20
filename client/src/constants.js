export const WHEEL_SPIN_DURATION_MS = 6000

export const RISK_TIERS = {
  safe: {
    id: 'safe',
    label: 'Safe',
    payoutMultiplier: 1.2,
    wheelSegments: [0.8, 1, 1, 1.2],
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    payoutMultiplier: 2,
    wheelSegments: [0.5, 1, 1.5, 2],
  },
  reckless: {
    id: 'reckless',
    label: 'Reckless',
    payoutMultiplier: 3,
    wheelSegments: [0.25, 0.5, 1, 2, 3],
  },
}
