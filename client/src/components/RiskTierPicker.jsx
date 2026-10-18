const riskTiers = [
  { id: 'safe', label: 'Safe', multiplier: 1.2 },
  { id: 'bold', label: 'Bold', multiplier: 2 },
  { id: 'reckless', label: 'Reckless', multiplier: 3 },
]

function RiskTierPicker({ selectedTier, stake, onSelectTier }) {
  return (
    <fieldset>
      <legend>Risk tier</legend>
      {riskTiers.map((riskTier) => {
        const potentialPayout = Number((stake * riskTier.multiplier).toFixed(2))

        return (
          <label key={riskTier.id}>
            <input
              type="radio"
              name="risk-tier"
              value={riskTier.id}
              checked={selectedTier === riskTier.id}
              onChange={() => onSelectTier(riskTier.id)}
            />
            {riskTier.label} — {riskTier.multiplier}x · Potential payout:{' '}
            {potentialPayout} points
          </label>
        )
      })}
    </fieldset>
  )
}

export default RiskTierPicker
