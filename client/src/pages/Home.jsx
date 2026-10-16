import { useState } from 'react'
import ChallengeCard from '../components/ChallengeCard'
import challenges from '../challenges.json'

function Home() {
  const [selection, setSelection] = useState({ challenges: [], total: 0 })

  function addChallenge(challenge) {
    setSelection((current) => {
      if (current.challenges.some((item) => item.id === challenge.id)) {
        return current
      }

      return {
        challenges: [...current.challenges, challenge],
        total: current.total + challenge.points,
      }
    })
  }

  function removeChallenge(challengeId) {
    setSelection((current) => {
      const remaining = current.challenges.filter((item) => item.id !== challengeId)

      return {
        challenges: remaining,
        total: remaining.reduce((total, item) => total + item.points, 0),
      }
    })
  }

  const selectedIds = new Set(selection.challenges.map((challenge) => challenge.id))

  return (
    <main>
      <h1>Study challenges</h1>
      <section aria-label="Available study challenges">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            isSelected={selectedIds.has(challenge.id)}
            onBet={addChallenge}
          />
        ))}
      </section>

      <section aria-labelledby="selected-heading">
        <h2 id="selected-heading">Selected</h2>
        {selection.challenges.length === 0 ? (
          <p>No challenges picked yet.</p>
        ) : (
          <ul>
            {selection.challenges.map((challenge) => (
              <li key={challenge.id}>
                {challenge.name} — {challenge.minutes} minutes — {challenge.points} points
                <button
                  type="button"
                  onClick={() => removeChallenge(challenge.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p>Total points at stake: {selection.total}</p>
      </section>
    </main>
  )
}

export default Home
