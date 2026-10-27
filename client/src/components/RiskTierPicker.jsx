import { RISK_TIERS } from '../constants'

function RiskTierPicker({ selectedTier, stake, onSelectTier }) {
  return (
    <fieldset className="risk-picker">
      <legend>Risk tier</legend>
      {Object.values(RISK_TIERS).map((riskTier) => {
        const potentialPayout = Number(
          (stake * riskTier.payoutMultiplier).toFixed(2),
        )
        const totalWheelWeight = riskTier.wheelWeights.reduce(
          (total, weight) => total + weight,
          0,
        )
        const wheelOdds = riskTier.wheelSegments
          .map((segment, index) => {
            const chance = (riskTier.wheelWeights[index] / totalWheelWeight) * 100
            return `${segment}x (${chance.toFixed(1)}%)`
          })
          .join(', ')

        return (
          <label
            className={`tier-option${selectedTier === riskTier.id ? ' is-selected' : ''}`}
            key={riskTier.id}
          >
            <input
              type="radio"
              name="risk-tier"
              value={riskTier.id}
              checked={selectedTier === riskTier.id}
              onChange={() => onSelectTier(riskTier.id)}
            />
            <span className="tier-copy">
              <span className="tier-name">{riskTier.label}</span>
              <span className="tier-details">
                Wheel odds: {wheelOdds} · Payout: {riskTier.payoutMultiplier}x ·
                Potential win: {potentialPayout} points
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default RiskTierPicker
