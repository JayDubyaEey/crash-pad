import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { VehicleIcon, SpeedSign, ImpactIcon } from './icons/VehicleIcon'

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
        {item.kind === 'vehicle' && <VehicleIcon type={item.vehicleType} />}
        {item.kind === 'sign' && <SpeedSign speed={item.speed} />}
        {item.kind === 'impact' && <ImpactIcon />}
      </div>

      {selected && (
        <div
          className="item-controls no-print flex items-center gap-0.5 whitespace-nowrap rounded-md bg-foreground p-0.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {item.kind === 'vehicle' && (
            <>
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                onClick={() => onChange({ ...item, rotation: (item.rotation ?? 0) - 15 })}
              >
                ⟲
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                onClick={() => onChange({ ...item, rotation: (item.rotation ?? 0) + 15 })}
              >
                ⟳
              </Button>
            </>
          )}
          {item.kind === 'sign' && (
            <input
              type="number"
              className="w-9 rounded px-1.5 py-0.5 text-xs"
              value={item.speed}
              onChange={(e) => onChange({ ...item, speed: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
          <Button type="button" size="icon-xs" variant="destructive" onClick={() => onDelete(item.id)}>
            ×
          </Button>
        </div>
      )}
    </div>
  )
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}
