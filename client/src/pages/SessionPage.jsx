import { useEffect, useState } from 'react'
import { RISK_TIERS, SESSION_TIMER_SPEED_MULTIPLIER } from '../constants'

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function SessionPage({ activeSession, points, onFinish, onNewSession }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    activeSession.actualMinutes * 60,
  )
  const isActive = activeSession.status === 'active'

  useEffect(() => {
    if (!isActive) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1))
    }, 1000 / SESSION_TIMER_SPEED_MULTIPLIER)

    return () => window.clearInterval(intervalId)
  }, [isActive])

  useEffect(() => {
    if (isActive && remainingSeconds === 0) {
      onFinish('won')
    }
  }, [isActive, remainingSeconds, onFinish])

  if (activeSession.status === 'won' || activeSession.status === 'lost') {
    return (
      <main>
        <h1>{activeSession.status === 'won' ? 'Session complete!' : 'Session ended'}</h1>
        {activeSession.status === 'won' ? (
          <p>
            You won {activeSession.pointsWon} points! Your balance is now {points}.
          </p>
        ) : (
          <p>
            You stopped early. Your {activeSession.bet}-point bet was forfeited.
          </p>
        )}
        <button type="button" onClick={onNewSession}>
          New session
        </button>
      </main>
    )
  }

  return (
    <main>
      <h1>Study session</h1>
      <p>Risk tier: {RISK_TIERS[activeSession.tier].label}</p>
      <p>Points at stake: {activeSession.bet}</p>
      <p aria-live="polite" aria-atomic="true">
        Time remaining: <strong>{formatTime(remainingSeconds)}</strong>
      </p>
      <button type="button" onClick={() => onFinish('lost')}>
        Stop session
      </button>
    </main>
  )
}

export default SessionPage
