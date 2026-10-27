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
    <main className="page-shell setup-page">
      <header className="page-heading">
        <p className="eyebrow">Build your next session</p>
        <h1>Study session setup</h1>
        <p>Choose your commitment and risk before the wheel sets your session.</p>
      </header>

      <p className="setup-balance">
        Available to play <strong>{points} pts</strong>
      </p>

      <form className="panel setup-panel setup-form" onSubmit={goToWheel}>
        <div className="form-field">
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
          <p className="form-error" role="alert">
            Choose a committed study time from 10 to 60 minutes.
          </p>
        )}

        <div className="form-field">
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
          <p className="notice">
            You have 0 points, so this is a free bailout session with no stake.
          </p>
        )}

        <RiskTierPicker
          selectedTier={tier}
          stake={stake}
          onSelectTier={setTier}
        />

        {cannotAffordBet && (
          <p className="form-error" role="alert">
            Your bet is higher than your points balance.
          </p>
        )}

        <button
          className="button-primary"
          type="submit"
          disabled={cannotAffordBet || invalidMinutes}
        >
          Go to the wheel
        </button>
      </form>
    </main>
  )
}

export default Home
