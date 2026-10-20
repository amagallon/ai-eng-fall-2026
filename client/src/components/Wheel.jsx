import { RISK_TIERS, WHEEL_SPIN_DURATION_MS } from '../constants'

const segmentColors = ['#8caf83', '#b5cc92', '#e9c56d', '#e7955c', '#c87766']

function Wheel({ tier, spinCount, wheelTargetIndex, onSpin, disabled }) {
  const segments = RISK_TIERS[tier].wheelSegments
  const segmentSize = 100 / segments.length
  const gradient = `conic-gradient(${segments
    .map((_, index) => {
      const start = index * segmentSize
      const end = (index + 1) * segmentSize
      return `${segmentColors[index % segmentColors.length]} ${start}% ${end}%`
    })
    .join(', ')})`

  function handleSpin() {
    if (disabled) {
      return
    }

    const selectedIndex = Math.floor(Math.random() * segments.length)
    onSpin(segments[selectedIndex], selectedIndex)
  }

  const targetRotation = spinCount > 0 && segments.length
    ? `${
        spinCount * 2160 -
        ((wheelTargetIndex + 0.5) * 360) / segments.length
      }deg`
    : '0deg'

  return (
    <section aria-label={`${RISK_TIERS[tier].label} risk wheel`}>
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          margin: '24px auto',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '4px solid #29382d',
            borderRadius: '50%',
            background: gradient,
            transform: `rotate(${targetRotation})`,
            transition: `transform ${WHEEL_SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`,
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          ▼
        </span>
      </div>

      <p>Wheel segments:</p>
      <ol>
        {segments.map((segment, index) => (
          <li key={`${index}-${segment}`}>{segment}x</li>
        ))}
      </ol>

      <button type="button" onClick={handleSpin} disabled={disabled}>
        Spin
      </button>
    </section>
  )
}

export default Wheel
