import './ProfileCard.css'

function ProfileCard() {
  return (
    <div className="card">
      <h1>Alex</h1>
      <img src="/ak.jpeg" alt="Profile picture" />
      <p id="bio">Student learning web dev.</p>
      <button id="hi-button">Say hi</button>
    </div>
  )
}

export default ProfileCard