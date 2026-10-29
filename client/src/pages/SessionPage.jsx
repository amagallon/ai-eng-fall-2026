import { useCallback, useEffect, useRef, useState } from 'react'
import DodgeButton from '../components/DodgeButton'
import {
  RISK_TIERS,
  SESSION_TIMER_SPEED_MULTIPLIER,
} from '../constants'

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function SessionPage({
  activeSession,
  onFinish,
  onSessionSaved,
  onSessionSaveFailed,
  onNewSession,
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    activeSession.actualMinutes * 60,
  )
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveError, setSaveError] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  const sessionAreaRef = useRef(null)
  const cursorPositionRef = useRef(null)
  const finishRequestRef = useRef(false)
  const isActive = activeSession.status === 'active'

  const finishSession = useCallback(async (outcome) => {
    if (!isActive || finishRequestRef.current) {
      return
    }

    finishRequestRef.current = true
    setIsFinishing(true)
    const payout =
      outcome === 'won'
        ? Math.round(
            activeSession.bet *
              RISK_TIERS[activeSession.tier].payoutMultiplier,
          )
        : 0
    const pointsChange =
      outcome === 'won' ? payout - activeSession.bet : -activeSession.bet

    onFinish(outcome, payout)
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          started_at: activeSession.startedAt,
          minutes_planned: activeSession.committedMinutes,
          actual_minutes: activeSession.actualMinutes,
          bet_amount: activeSession.bet,
          tier: RISK_TIERS[activeSession.tier].label,
          result: outcome,
          points_change: pointsChange,
        }),
      })

      if (!response.ok) {
        throw new Error('The server could not save this session.')
      }

      const savedSession = await response.json()
      onSessionSaved(savedSession)
      setSaveStatus('saved')
    } catch {
      onSessionSaveFailed()
      setSaveError(
        'Your session ended, but we couldn’t save it to history. Please check your connection and try again later.',
      )
      setSaveStatus('error')
    }
  }, [
    activeSession,
    isActive,
    onFinish,
    onSessionSaved,
    onSessionSaveFailed,
  ])

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
    if (!isActive || remainingSeconds !== 0) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => finishSession('won'), 0)
    return () => window.clearTimeout(timeoutId)
  }, [isActive, remainingSeconds, finishSession])

  function updateCursorPosition(clientX, clientY) {
    const area = sessionAreaRef.current
    if (!area) {
      return
    }

    const bounds = area.getBoundingClientRect()
    cursorPositionRef.current = {
      x: clientX - bounds.left,
      y: clientY - bounds.top,
    }
  }

  function handleAreaTouch(event) {
    const touch = event.touches[0]
    if (touch) {
      updateCursorPosition(touch.clientX, touch.clientY)
    }
  }

  if (activeSession.status === 'won' || activeSession.status === 'lost') {
    return (
      <main className="page-shell result-page">
        <section className="panel result-card">
          <p className="eyebrow">
            {activeSession.status === 'won' ? 'Session settled' : 'Session closed'}
          </p>
          <h1>
            {activeSession.status === 'won' ? 'Session complete!' : 'Session ended'}
          </h1>
          {activeSession.status === 'won' ? (
            <p>
              You won {activeSession.pointsWon} points!
            </p>
          ) : (
            <p>
              You stopped early. Your {activeSession.bet}-point bet was forfeited.
            </p>
          )}
          {saveStatus === 'saving' && (
            <p role="status">Saving this session to your history…</p>
          )}
          {saveStatus === 'saved' && (
            <p role="status">This session was saved to your history.</p>
          )}
          {saveError && (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          )}
          <button className="button-primary" type="button" onClick={onNewSession}>
            New session
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell session-page">
      <header className="page-heading">
        <p className="eyebrow">Stay in the zone</p>
        <h1>Study session</h1>
      </header>
      <section className="panel timer-panel">
        <div className="session-summary">
          <span className="session-chip">{RISK_TIERS[activeSession.tier].label} risk</span>
          <span className="session-chip">{activeSession.bet} points at stake</span>
        </div>
        <p className="eyebrow">Time remaining</p>
        <p className="timer-display" aria-live="polite" aria-atomic="true">
          {formatTime(remainingSeconds)}
        </p>
        <section
          className="session-arena"
          ref={sessionAreaRef}
          aria-label="Active study session"
          onMouseMove={(event) =>
            updateCursorPosition(event.clientX, event.clientY)
          }
          onMouseLeave={() => {
            cursorPositionRef.current = null
          }}
          onTouchStart={handleAreaTouch}
          onTouchMove={handleAreaTouch}
          onTouchEnd={() => {
            cursorPositionRef.current = null
          }}
          onTouchCancel={() => {
            cursorPositionRef.current = null
          }}
        >
          <DodgeButton
            areaRef={sessionAreaRef}
            cursorPositionRef={cursorPositionRef}
            tier={activeSession.tier}
            isActive={isActive && !isFinishing}
            onClick={() => finishSession('lost')}
          />
        </section>
        {saveStatus === 'saving' && (
          <p role="status">Saving your completed session…</p>
        )}
      </section>
    </main>
  )
}

export default SessionPage
