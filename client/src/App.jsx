import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import HistoryPage from './pages/HistoryPage'
import Home from './pages/Home'
import SessionPage from './pages/SessionPage'
import WheelPage from './pages/WheelPage'

async function getSavedSessions() {
  const response = await fetch('/api/sessions')
  if (!response.ok) {
    throw new Error('Could not load saved sessions.')
  }

  const savedSessions = await response.json()
  if (!Array.isArray(savedSessions)) {
    throw new Error('The sessions response was not a list.')
  }

  return savedSessions
}

function AppRoutes() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [balanceError, setBalanceError] = useState('')
  const [pendingBet, setPendingBet] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [minutes, setMinutes] = useState(25)
  const [bet, setBet] = useState(10)
  const [tier, setTier] = useState('safe')
  const [hasCommitted, setHasCommitted] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const sessionFinishedRef = useRef(false)

  const savedPoints =
    100 + sessions.reduce((total, session) => total + session.points_change, 0)
  const points = savedPoints - pendingBet

  const refreshSessions = useCallback(async () => {
    const savedSessions = await getSavedSessions()
    setSessions((currentSessions) => {
      const mergedSessions = new Map(
        savedSessions.map((session) => [session.id, session]),
      )
      currentSessions.forEach((session) => mergedSessions.set(session.id, session))
      return [...mergedSessions.values()].sort(
        (first, second) =>
          second.started_at.localeCompare(first.started_at) || second.id - first.id,
      )
    })
    setBalanceError('')
    setIsLoadingBalance(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    getSavedSessions()
      .then((savedSessions) => {
        if (isMounted) {
          setSessions((currentSessions) => {
            const mergedSessions = new Map(
              savedSessions.map((session) => [session.id, session]),
            )
            currentSessions.forEach((session) =>
              mergedSessions.set(session.id, session),
            )
            return [...mergedSessions.values()].sort(
              (first, second) =>
                second.started_at.localeCompare(first.started_at) ||
                second.id - first.id,
            )
          })
          setBalanceError('')
          setIsLoadingBalance(false)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setBalanceError(error.message)
          setIsLoadingBalance(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const reservePoints = useCallback(
    (updatePoints) => {
      const nextPoints =
        typeof updatePoints === 'function' ? updatePoints(points) : updatePoints
      setPendingBet(Math.max(0, savedPoints - nextPoints))
    },
    [points, savedPoints],
  )

  const handleWheelResult = useCallback(
    ({ multiplier, actualMinutes }) => {
      sessionFinishedRef.current = false
      setActiveSession({
        committedMinutes: minutes,
        actualMinutes,
        wheelMultiplier: multiplier,
        bet,
        tier,
        startedAt: null,
        status: 'ready',
      })
    },
    [minutes, bet, tier],
  )

  const startSession = useCallback(() => {
    setActiveSession((current) => {
      if (current?.status !== 'ready') {
        return current
      }

      return {
        ...current,
        startedAt: new Date().toISOString(),
        status: 'active',
      }
    })
    navigate('/session')
  }, [navigate])

  const finishSession = useCallback(
    (outcome, pointsWon) => {
      if (activeSession?.status !== 'active' || sessionFinishedRef.current) {
        return
      }

      sessionFinishedRef.current = true
      setActiveSession((current) =>
        current?.status === 'active'
          ? { ...current, status: outcome, pointsWon }
          : current,
      )
    },
    [activeSession],
  )

  const handleSessionSaved = useCallback(
    (savedSession) => {
      setSessions((currentSessions) => {
        const mergedSessions = new Map(
          currentSessions.map((session) => [session.id, session]),
        )
        mergedSessions.set(savedSession.id, savedSession)
        return [...mergedSessions.values()].sort(
          (first, second) =>
            second.started_at.localeCompare(first.started_at) || second.id - first.id,
        )
      })
      setPendingBet(0)
      refreshSessions().catch((error) => setBalanceError(error.message))
    },
    [refreshSessions],
  )

  const handleSessionSaveFailed = useCallback(() => {
    setPendingBet(0)
  }, [])

  const startNewSession = useCallback(() => {
    sessionFinishedRef.current = false
    setHasCommitted(false)
    setActiveSession(null)
    navigate('/')
  }, [navigate])

  return (
    <div className="app-shell">
      <nav className="topbar" aria-label="Main navigation">
        <div className="nav-links">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              S/
            </span>
            <span>STUDY / SIGNAL</span>
          </Link>
          <Link to="/history" className="nav-history">
            History
          </Link>
          <a
            href="/api"
            className="nav-history"
            target="_blank"
            rel="noopener noreferrer"
          >
            API
          </a>
        </div>
        <p className="topbar-note">Points are fake and have no real-world value.</p>
        <div
          className="nav-balance"
          aria-label={`Points balance: ${isLoadingBalance ? 'loading' : points}`}
        >
          <span className="nav-balance-label">Points balance</span>
          <strong className="nav-balance-value">
            {isLoadingBalance ? '…' : points.toLocaleString()}
          </strong>
          {balanceError && (
            <span className="balance-error" role="status">
              Balance unavailable
            </span>
          )}
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            hasCommitted ? (
              <Navigate to="/wheel" replace />
            ) : (
              <Home
                points={points}
                setPoints={reservePoints}
                minutes={minutes}
                setMinutes={setMinutes}
                bet={bet}
                setBet={setBet}
                tier={tier}
                setTier={setTier}
                setHasCommitted={setHasCommitted}
              />
            )
          }
        />
        <Route
          path="/wheel"
          element={
            hasCommitted ? (
              <WheelPage
                minutes={minutes}
                bet={bet}
                tier={tier}
                activeSession={activeSession}
                onWheelResult={handleWheelResult}
                onStartSession={startSession}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/session"
          element={
            activeSession &&
            ['active', 'won', 'lost'].includes(activeSession.status) ? (
              <SessionPage
                activeSession={activeSession}
                onFinish={finishSession}
                onSessionSaved={handleSessionSaved}
                onSessionSaveFailed={handleSessionSaveFailed}
                onNewSession={startNewSession}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
