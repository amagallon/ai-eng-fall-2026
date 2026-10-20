import { RISK_TIERS } from '../constants'

function RiskTierPicker({ selectedTier, stake, onSelectTier }) {
  return (
    <fieldset>
      <legend>Risk tier</legend>
      {Object.values(RISK_TIERS).map((riskTier) => {
        const potentialPayout = Number(
          (stake * riskTier.payoutMultiplier).toFixed(2),
        )

        return (
          <label key={riskTier.id}>
            <input
              type="radio"
              name="risk-tier"
              value={riskTier.id}
              checked={selectedTier === riskTier.id}
              onChange={() => onSelectTier(riskTier.id)}
            />
            {riskTier.label} — wheel: {riskTier.wheelSegments.join('x, ')}x ·
            Payout: {riskTier.payoutMultiplier}x · Potential win: {potentialPayout}{' '}
            points
          </label>
        )
      })}
    </fieldset>
  )
}

export default RiskTierPicker
