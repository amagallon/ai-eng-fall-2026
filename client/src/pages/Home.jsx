import { useState } from 'react'
import RiskTierPicker from '../components/RiskTierPicker'

function Home() {
  const [points, setPoints] = useState(100)
  const [bet, setBet] = useState(10)
  const [minutes, setMinutes] = useState(25)
  const [tier, setTier] = useState('safe')
  const [activeSession, setActiveSession] = useState(null)

  const isBailout = points === 0
  const stake = isBailout ? 0 : bet
  const cannotAffordBet = !isBailout && bet > points

  function startSession(event) {
    event.preventDefault()

    if (activeSession || cannotAffordBet || minutes < 1) {
      return
    }

    setPoints((currentPoints) => currentPoints - stake)
    setActiveSession({ bet: stake, minutes, tier })
  }

  return (
    <main>
      <h1>Study session</h1>
      <p aria-live="polite">Points balance: {points}</p>

      {activeSession ? (
        <section aria-labelledby="session-heading">
          <h2 id="session-heading">Bet locked in</h2>
          <p>
            {activeSession.minutes} minutes · {activeSession.bet} points at stake ·{' '}
            {activeSession.tier}
          </p>
          <p>The timer and session results are not built yet.</p>
        </section>
      ) : (
        <form onSubmit={startSession}>
          <div>
            <label htmlFor="minutes">Study time (minutes)</label>
            <input
              id="minutes"
              type="number"
              min="1"
              step="1"
              required
              value={minutes || ''}
              onChange={(event) => {
                setMinutes(event.target.value === '' ? 0 : Number(event.target.value))
              }}
            />
          </div>

          <div>
            <label htmlFor="bet">Bet amount: {bet} points</label>
            <input
              id="bet"
              type="range"
              min="10"
              max="50"
              step="1"
              value={bet}
              disabled={isBailout}
              onChange={(event) => setBet(Number(event.target.value))}
            />
          </div>

          {isBailout && (
            <p>
              You have 0 points, so this is a free bailout session with no points at
              stake.
            </p>
          )}

          <RiskTierPicker
            selectedTier={tier}
            stake={stake}
            onSelectTier={setTier}
          />

          {cannotAffordBet && (
            <p role="alert">
              Your bet is higher than your points balance. Lower the bet to start.
            </p>
          )}

          <button type="submit" disabled={cannotAffordBet}>
            {isBailout ? 'Start free bailout session' : 'Start'}
          </button>
        </form>
      )}
    </main>
  )
}

export default Home
