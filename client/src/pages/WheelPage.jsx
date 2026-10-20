import { useState } from 'react'
import Wheel from '../components/Wheel'
import { RISK_TIERS, WHEEL_SPIN_DURATION_MS } from '../constants'

function WheelPage({ minutes, bet, tier }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [wheelTargetIndex, setWheelTargetIndex] = useState(0)
  const [result, setResult] = useState(null)

  function handleSpin(multiplier, targetIndex) {
    if (isSpinning || result) {
      return
    }

    setIsSpinning(true)
    setSpinCount((currentCount) => currentCount + 1)
    setWheelTargetIndex(targetIndex)

    window.setTimeout(() => {
      const actualMinutes = Math.min(
        90,
        Math.max(1, Math.round(minutes * multiplier)),
      )

      setResult({ multiplier, actualMinutes })
      setIsSpinning(false)
    }, WHEEL_SPIN_DURATION_MS)
  }

  return (
    <main>
      <Wheel
        tier={tier}
        spinCount={spinCount}
        wheelTargetIndex={wheelTargetIndex}
        onSpin={handleSpin}
        disabled={isSpinning || Boolean(result)}
      />
      {isSpinning && <p role="status">The wheel is spinning…</p>}
      {result && (
        <section aria-live="polite">
          <h1>The wheel landed on {result.multiplier}x!</h1>
          <p>
            Your {minutes}-minute commitment becomes a {result.actualMinutes}-minute
            study session.
          </p>
          <p>
            {bet === 0
              ? 'Free bailout session — no points at stake.'
              : `${bet} points at stake · ${RISK_TIERS[tier].label} tier`}
          </p>
        </section>
      )}
    </main>
  )
}

export default WheelPage
