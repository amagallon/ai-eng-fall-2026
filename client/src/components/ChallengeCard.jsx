function ChallengeCard({ challenge, isSelected, onBet }) {
  return (
    <article>
      <h2>{challenge.name}</h2>
      <p>
        {challenge.minutes} minutes · {challenge.points} points
      </p>
      <button
        type="button"
        onClick={() => onBet(challenge)}
        disabled={isSelected}
      >
        {isSelected ? 'Selected' : 'Bet'}
      </button>
    </article>
  )
}

export default ChallengeCard
