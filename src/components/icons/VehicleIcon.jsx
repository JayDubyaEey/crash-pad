// Simplified top-down vehicle silhouettes. Real accident diagrams use plain
// outline shapes like this rather than detailed art — clarity over realism.
export const VEHICLE_TYPES = [
  { type: 'bike', label: 'Bike', color: '#059669', w: 14, h: 40 },
  { type: 'car', label: 'Car', color: '#2563eb', w: 26, h: 48 },
  { type: 'truck', label: 'Truck', color: '#d97706', w: 30, h: 56 },
  { type: 'bus', label: 'Bus', color: '#7c3aed', w: 28, h: 72 },
  { type: 'lorry', label: 'Lorry', color: '#dc2626', w: 30, h: 84 },
]

export function VehicleIcon({ type }) {
  const spec = VEHICLE_TYPES.find((v) => v.type === type) ?? VEHICLE_TYPES[1]
  const { w, h, color } = spec
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={w * 0.3}
        fill={color}
        stroke="#111"
        strokeWidth="1.5"
      />
      {/* front-of-vehicle indicator */}
      <polygon
        points={`${w / 2},${h * 0.1} ${w * 0.32},${h * 0.28} ${w * 0.68},${h * 0.28}`}
        fill="#fff"
      />
    </svg>
  )
}

export function ImpactIcon() {
  const size = 36
  const points = starPoints(18, 18, 8, 16, 8)
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <polygon points={points} fill="#f97316" stroke="#7c2d12" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function starPoints(cx, cy, innerR, outerR, spikes) {
  const step = Math.PI / spikes
  let angle = -Math.PI / 2
  const pts = []
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
    angle += step
  }
  return pts.join(' ')
}

export function SpeedSign({ speed }) {
  const size = 40
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#fff" stroke="#d90000" strokeWidth="4" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="#111"
      >
        {speed}
      </text>
    </svg>
  )
}
