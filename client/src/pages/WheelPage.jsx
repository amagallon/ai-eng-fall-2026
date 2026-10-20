import { useState } from 'react'
import Wheel from '../components/Wheel'
import { RISK_TIERS, WHEEL_SPIN_DURATION_MS } from '../constants'

function WheelPage({
  minutes,
  bet,
  tier,
  activeSession,
  onWheelResult,
  onStartSession,
}) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [wheelTargetIndex, setWheelTargetIndex] = useState(0)

  function handleSpin(multiplier, targetIndex) {
    if (isSpinning || activeSession) {
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

      onWheelResult({ multiplier, actualMinutes })
      setIsSpinning(false)
    }, WHEEL_SPIN_DURATION_MS)
  }

  function handleStartSession() {
    onStartSession()
  }

  return (
    <main>
      <Wheel
        tier={tier}
        spinCount={spinCount}
        wheelTargetIndex={wheelTargetIndex}
        onSpin={handleSpin}
        disabled={isSpinning || Boolean(activeSession)}
      />
      {isSpinning && <p role="status">The wheel is spinning…</p>}
      {activeSession && (
        <section aria-live="polite">
          <h1>The wheel landed on {activeSession.wheelMultiplier}x!</h1>
          <p>
            Your {activeSession.committedMinutes}-minute commitment becomes a{' '}
            {activeSession.actualMinutes}-minute study session.
          </p>
          <p>
            {bet === 0
              ? 'Free bailout session — no points at stake.'
              : `${bet} points at stake · ${RISK_TIERS[tier].label} tier`}
          </p>
          <button type="button" onClick={handleStartSession}>
            Start session
          </button>
        </section>
      )}
    </main>
  )
}

export default WheelPage
