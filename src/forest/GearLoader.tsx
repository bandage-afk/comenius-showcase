const R = 78
const CIRC = 2 * Math.PI * R
const TEETH = 28

export default function GearLoader({
  progress,
  label = 'LOADING',
}: {
  progress: number
  label?: string
}) {
  const teeth = Array.from({ length: TEETH }, (_, i) => {
    const angle = (360 / TEETH) * i
    const alt = i % 4 === 0
    return (
      <rect
        key={i}
        x={-6.5}
        y={-96}
        width={13}
        height={19}
        rx={4}
        className={`gear-teeth${alt ? ' alt' : ''}`}
        transform={`rotate(${angle})`}
      />
    )
  })

  return (
    <div className="gear-loader" aria-label={`${label} ${Math.round(progress * 100)}%`}>
      <svg viewBox="-110 -110 220 220" width="190" height="190">
        <circle className="gear-track" cx="0" cy="0" r={R} />
        <circle
          className="gear-progress"
          cx="0"
          cy="0"
          r={R}
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          transform="rotate(-90)"
        />
        <g className="gear-spin">{teeth}</g>
        <text className="gear-center" x="0" y="2" textAnchor="middle">
          NIGHT
        </text>
        <text className="gear-percent" x="0" y="26" textAnchor="middle">
          {Math.round(progress * 100)}%
        </text>
      </svg>
    </div>
  )
}
