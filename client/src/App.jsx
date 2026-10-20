import { useCallback, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { RISK_TIERS } from './constants'
import Home from './pages/Home'
import SessionPage from './pages/SessionPage'
import WheelPage from './pages/WheelPage'

function AppRoutes() {
  const navigate = useNavigate()
  const [points, setPoints] = useState(100)
  const [minutes, setMinutes] = useState(25)
  const [bet, setBet] = useState(10)
  const [tier, setTier] = useState('safe')
  const [hasCommitted, setHasCommitted] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const sessionFinishedRef = useRef(false)

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
