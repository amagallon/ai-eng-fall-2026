import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import WheelPage from './pages/WheelPage'

function App() {
  const [points, setPoints] = useState(100)
  const [minutes, setMinutes] = useState(25)
  const [bet, setBet] = useState(10)
  const [tier, setTier] = useState('safe')
  const [hasCommitted, setHasCommitted] = useState(false)

  return (
    <BrowserRouter>
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
              <WheelPage minutes={minutes} bet={bet} tier={tier} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
