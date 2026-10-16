function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

export default StatCard
