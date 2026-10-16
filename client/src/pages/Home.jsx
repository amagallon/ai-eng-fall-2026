import { useState } from 'react'
import ProfileCard from '../components/ProfileCard'
import StatCard from '../components/StatCard'

function Home() {
  const [points, setPoints] = useState(0)

  return (
    <>
      <ProfileCard />
      <section aria-label="Stats">
        <StatCard label="Points" value={points} />
        <button type="button" onClick={() => setPoints((current) => current + 10)}>
          Win +10
        </button>
        <button type="button" onClick={() => setPoints((current) => current - 10)}>
          Lose -10
        </button>
        <StatCard label="Sessions" value="8" />
        <StatCard label="Best streak" value="5 days" />
      </section>
    </>
  )
}

export default Home
