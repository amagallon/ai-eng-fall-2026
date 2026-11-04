import { useCallback, useEffect, useRef, useState } from 'react'

async function getSessions(signal) {
  const response = await fetch('/api/sessions', { signal })
  if (!response.ok) {
    throw new Error('Could not load your session history.')
  }

  const savedSessions = await response.json()
  if (!Array.isArray(savedSessions)) {
    throw new Error('The session history response was not a list.')
  }

  return savedSessions
}

function formatSessionDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function HistoryPage({ onSessionsReset }) {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState('')
  const cancelButtonRef = useRef(null)
  const resetButtonRef = useRef(null)

  const loadSessions = useCallback(async (signal) => {
    try {
      setSessions(await getSessions(signal))
    } catch (loadError) {
      if (loadError.name !== 'AbortError') {
        setError('We couldn’t load your session history. Please try again.')
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getSessions(controller.signal)
      .then(setSessions)
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') {
          setError('We couldn’t load your session history. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!isResetModalOpen) {
      return undefined
    }

    cancelButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsResetModalOpen(false)
        setResetError('')
        resetButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isResetModalOpen])

  function closeResetModal() {
    setIsResetModalOpen(false)
    setResetError('')
    resetButtonRef.current?.focus()
  }

  async function resetSessions() {
    setIsResetting(true)
    setResetError('')

    try {
      const response = await fetch('/api/sessions', { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('The server could not reset your saved sessions.')
      }

      const result = await response.json()
      if (!Number.isInteger(result.deleted)) {
        throw new Error('The server returned an invalid reset response.')
      }

      onSessionsReset([])
      setSessions([])
      const refreshedSessions = await getSessions()
      setSessions(refreshedSessions)
      onSessionsReset(refreshedSessions)
      setIsResetModalOpen(false)
      resetButtonRef.current?.focus()
    } catch {
      setResetError(
        'We couldn’t reset your points and history. Please check your connection and try again.',
      )
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <main className="page-shell history-page">
      <header className="page-heading">
        <p className="eyebrow">Your progress</p>
        <h1>Session history</h1>
        <p>Review your completed study sessions and point changes.</p>
        <button
          className="button-secondary history-reset-button"
          type="button"
          ref={resetButtonRef}
          onClick={() => {
            setResetError('')
            setIsResetModalOpen(true)
          }}
        >
          Reset points and history
        </button>
      </header>

      {isLoading && (
        <p className="panel history-message" role="status">
          Loading sessions…
        </p>
      )}

      {!isLoading && error && (
        <section className="panel history-message" role="alert">
          <p className="form-error">{error}</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setIsLoading(true)
              setError('')
              loadSessions()
            }}
          >
            Try again
          </button>
        </section>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <p className="panel history-message">No sessions yet</p>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <ol className="history-list">
          {sessions.map((session) => (
            <li className="panel history-entry" key={session.id}>
              <div className="history-entry-heading">
                <time dateTime={session.started_at}>
                  {formatSessionDate(session.started_at)}
                </time>
                <span
                  className={`history-result history-result-${session.result}`}
                >
                  {session.result}
                </span>
              </div>
              <dl className="history-details">
                <div>
                  <dt>Study time</dt>
                  <dd>
                    {session.actual_minutes} min
                    <span> (planned {session.minutes_planned} min)</span>
                  </dd>
                </div>
                <div>
                  <dt>Bet</dt>
                  <dd>{session.bet_amount} pts</dd>
                </div>
                <div>
                  <dt>Tier</dt>
                  <dd>{session.tier}</dd>
                </div>
                <div>
                  <dt>Points change</dt>
                  <dd
                    className={
                      session.points_change >= 0
                        ? 'history-points-positive'
                        : 'history-points-negative'
                    }
                  >
                    {session.points_change > 0 ? '+' : ''}
                    {session.points_change} pts
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      )}

      {isResetModalOpen && (
        <div
          className="reset-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeResetModal()
            }
          }}
        >
          <section
            className="panel reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            aria-describedby="reset-modal-description"
          >
            <h2 id="reset-modal-title">Reset points and history?</h2>
            <p id="reset-modal-description">
              This deletes all saved sessions and resets your points to 100.
            </p>
            {resetError && (
              <p className="form-error reset-modal-error" role="alert">
                {resetError}
              </p>
            )}
            <div className="reset-modal-actions">
              <button
                className="button-secondary"
                type="button"
                ref={cancelButtonRef}
                onClick={closeResetModal}
              >
                Cancel
              </button>
              <button
                className="button-primary"
                type="button"
                onClick={resetSessions}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting…' : 'Yes, reset'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default HistoryPage
