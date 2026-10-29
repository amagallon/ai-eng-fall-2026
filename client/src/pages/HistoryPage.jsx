import { useCallback, useEffect, useState } from 'react'

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

function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <main className="page-shell history-page">
      <header className="page-heading">
        <p className="eyebrow">Your progress</p>
        <h1>Session history</h1>
        <p>Review your completed study sessions and point changes.</p>
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
    </main>
  )
}

export default HistoryPage
