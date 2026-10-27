import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { RISK_TIERS } from './constants'
import Home from './pages/Home'
import SessionPage from './pages/SessionPage'
import WheelPage from './pages/WheelPage'

function AppRoutes() {
  const navigate = useNavigate()
  const [points, setPoints] = useState(() => {
    try {
      const savedPoints = window.localStorage.getItem('studyPoints')
      if (savedPoints === null || savedPoints.trim() === '') {
        return 100
      }

      const parsedPoints = Number(savedPoints)
      return Number.isFinite(parsedPoints) && parsedPoints >= 0
        ? parsedPoints
        : 100
    } catch {
      return 100
    }
  })
  const [minutes, setMinutes] = useState(25)
  const [bet, setBet] = useState(10)
  const [tier, setTier] = useState('safe')
  const [hasCommitted, setHasCommitted] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const sessionFinishedRef = useRef(false)

  useEffect(() => {
    try {
      window.localStorage.setItem('studyPoints', String(points))
    } catch {
      // Storage may be unavailable; keep the in-memory balance usable.
    }
  }, [points])

  const handleWheelResult = useCallback(
    ({ multiplier, actualMinutes }) => {
      sessionFinishedRef.current = false
      setActiveSession({
        committedMinutes: minutes,
        actualMinutes,
        wheelMultiplier: multiplier,
        bet,
        tier,
        status: 'ready',
      })
    },
    [minutes, bet, tier],
  )

  const startSession = useCallback(() => {
    setActiveSession((current) =>
      current?.status === 'ready' ? { ...current, status: 'active' } : current,
    )
    navigate('/session')
  }, [navigate])

  const finishSession = useCallback(
    (outcome) => {
      if (activeSession?.status !== 'active' || sessionFinishedRef.current) {
        return
      }

      sessionFinishedRef.current = true
      const pointsWon =
        outcome === 'won'
          ? activeSession.bet * RISK_TIERS[activeSession.tier].payoutMultiplier
          : 0

      if (pointsWon > 0) {
        setPoints((currentPoints) => currentPoints + pointsWon)
      }

      setActiveSession((current) =>
        current?.status === 'active'
          ? { ...current, status: outcome, pointsWon }
          : current,
      )
    },
    [activeSession],
  )

  const startNewSession = useCallback(() => {
    sessionFinishedRef.current = false
    setHasCommitted(false)
    setActiveSession(null)
    navigate('/')
  }, [navigate])

  return (
    <div className="app-shell">
      <nav className="topbar" aria-label="Main navigation">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            S/
          </span>
          <span>STUDY / SIGNAL</span>
        </Link>
        <p className="topbar-note">Points are fake and have no real-world value.</p>
        <div className="nav-balance" aria-label={`Points balance: ${points}`}>
          <span className="nav-balance-label">Points balance</span>
          <strong className="nav-balance-value">{points.toLocaleString()}</strong>
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
                setPoints={setPoints}
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
                points={points}
                onFinish={finishSession}
                onNewSession={startNewSession}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
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
