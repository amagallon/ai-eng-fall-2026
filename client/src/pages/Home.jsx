import { useNavigate } from 'react-router-dom'
import RiskTierPicker from '../components/RiskTierPicker'

function Home({
  points,
  setPoints,
  minutes,
  setMinutes,
  bet,
  setBet,
  tier,
  setTier,
  setHasCommitted,
}) {
  const navigate = useNavigate()
  const isBailout = points === 0
  const stake = isBailout ? 0 : bet
  const cannotAffordBet = !isBailout && bet > points
  const invalidMinutes = !Number.isInteger(minutes) || minutes < 10 || minutes > 60

  function goToWheel(event) {
    event.preventDefault()

    if (cannotAffordBet || invalidMinutes) {
      return
    }

    setPoints((currentPoints) => currentPoints - stake)
    setHasCommitted(true)
    navigate('/wheel')
  }

  return (
    <main>
      <h1>Study session setup</h1>
      <p>Points balance: {points}</p>

      <form onSubmit={goToWheel}>
        <div>
          <label htmlFor="minutes">Committed study time (minutes)</label>
          <input
            id="minutes"
            type="number"
            min="10"
            max="60"
            step="1"
            required
            value={minutes || ''}
            onChange={(event) => {
              setMinutes(event.target.value === '' ? 0 : Number(event.target.value))
            }}
          />
        </div>
        {invalidMinutes && (
          <p role="alert">Choose a committed study time from 10 to 60 minutes.</p>
        )}

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
          <p>You have 0 points, so this is a free bailout session with no stake.</p>
        )}

        <RiskTierPicker
          selectedTier={tier}
          stake={stake}
          onSelectTier={setTier}
        />

        {cannotAffordBet && (
          <p role="alert">Your bet is higher than your points balance.</p>
        )}

        <button type="submit" disabled={cannotAffordBet || invalidMinutes}>
          Go to the wheel
        </button>
      </form>
    </main>
  )
}

export default Home
