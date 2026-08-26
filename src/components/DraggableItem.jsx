import { useRef } from 'react'
import { VehicleIcon, SpeedSign } from './icons/VehicleIcon'

// Drags an already-placed item (vehicle icon or speed sign) around within
// its panel using pointer events, so it works with both mouse and touch.
export function DraggableItem({ item, panelRef, selected, onChange, onSelect, onDelete }) {
  const dragging = useRef(false)

  function handlePointerDown(e) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    onSelect(item.id)
  }

  function handlePointerMove(e) {
    if (!dragging.current || !panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100)
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100)
    onChange({ ...item, x, y })
  }

  function handlePointerUp(e) {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      className={`placed-item${selected ? ' selected' : ''}`}
      style={{ left: `${item.x}%`, top: `${item.y}%` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="placed-item-shape" style={{ transform: `rotate(${item.rotation ?? 0}deg)` }}>
        {item.kind === 'vehicle' ? <VehicleIcon type={item.vehicleType} /> : <SpeedSign speed={item.speed} />}
      </div>

      {selected && (
        <div className="item-controls no-print" onPointerDown={(e) => e.stopPropagation()}>
          {item.kind === 'vehicle' ? (
            <>
              <button type="button" onClick={() => onChange({ ...item, rotation: (item.rotation ?? 0) - 15 })}>
                ⟲
              </button>
              <button type="button" onClick={() => onChange({ ...item, rotation: (item.rotation ?? 0) + 15 })}>
                ⟳
              </button>
            </>
          ) : (
            <input
              type="number"
              value={item.speed}
              onChange={(e) => onChange({ ...item, speed: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
          <button type="button" className="delete-btn" onClick={() => onDelete(item.id)}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}
