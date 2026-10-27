import { RISK_TIERS, WHEEL_SPIN_DURATION_MS } from '../constants'

const segmentColors = ['#76d4a2', '#4fae9b', '#b7d987', '#dfb967', '#df826e']

function Wheel({ tier, spinCount, wheelTargetIndex, onSpin, disabled }) {
  const { wheelSegments: segments, wheelWeights: weights } = RISK_TIERS[tier]
  const totalWeight = weights.reduce((total, weight) => total + weight, 0)
  const segmentDetails = segments.map((multiplier, index) => {
    const precedingWeight = weights
      .slice(0, index)
      .reduce((total, weight) => total + weight, 0)
    const startAngle = (precedingWeight / totalWeight) * 360
    const endAngle = ((precedingWeight + weights[index]) / totalWeight) * 360

    return {
      multiplier,
      weight: weights[index],
      startAngle,
      endAngle,
      centerAngle: (startAngle + endAngle) / 2,
      chance: (weights[index] / totalWeight) * 100,
    }
  })
  const gradient = `conic-gradient(${segmentDetails
    .map(
      (segment, index) =>
        `${segmentColors[index % segmentColors.length]} ${segment.startAngle}deg ${segment.endAngle}deg`,
    )
    .join(', ')})`

  function handleSpin() {
    if (disabled) {
      return
    }

    let selection = Math.random() * totalWeight
    const selectedIndex = weights.findIndex((weight) => {
      selection -= weight
      return selection < 0
    })
    const safeIndex = selectedIndex === -1 ? weights.length - 1 : selectedIndex
    onSpin(segments[safeIndex], safeIndex)
  }

  const targetRotation =
    spinCount > 0 && segments.length
      ? `${spinCount * 2160 - segmentDetails[wheelTargetIndex].centerAngle}deg`
      : '0deg'

  return (
    <section className="wheel-section" aria-label={`${RISK_TIERS[tier].label} risk wheel`}>
      <div className="wheel-stage" aria-hidden="true">
        <div
          className="wheel-disc"
          style={{
            background: gradient,
            transform: `rotate(${targetRotation})`,
            transition: `transform ${WHEEL_SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`,
          }}
        >
          {segmentDetails.map((segment, index) => {
            const centerRadians = (segment.centerAngle * Math.PI) / 180
            const labelRadiusPercent = 32

            return (
              <span
                className="wheel-segment-label"
                key={`${index}-${segment.multiplier}`}
                style={{
                  left: `${50 + Math.sin(centerRadians) * labelRadiusPercent}%`,
                  top: `${50 - Math.cos(centerRadians) * labelRadiusPercent}%`,
                }}
              >
                {segment.multiplier}x
              </span>
            )
          })}
        </div>
        <span className="wheel-pointer">▼</span>
      </div>

      <p className="wheel-label">Wheel segments</p>
      <ol className="wheel-segments">
        {segmentDetails.map((segment, index) => (
          <li key={`${index}-${segment.multiplier}`}>
            {segment.multiplier}x · {segment.chance.toFixed(1)}%
          </li>
        ))}
      </ol>

      <button
        className="button-primary"
        type="button"
        onClick={handleSpin}
        disabled={disabled}
      >
        Spin
      </button>
    </section>
  )
}

export default Wheel
