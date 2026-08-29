import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { VehicleIcon, SpeedSign, ImpactIcon } from './icons/VehicleIcon'

// Drags an already-placed item (vehicle icon or speed sign) around within
// its panel using pointer events, so it works with both mouse and touch.
export function DraggableItem({ item, panelRef, selected, onChange, onSelect, onDelete }) {
  const dragging = useRef(false)
  const rotating = useRef(false)
  const shapeRef = useRef(null)

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

  // Free rotation: angle from the shape's center to the pointer, offset so
  // "straight down" (handle directly below, out from under the toolbar) is
  // 0deg — matches the icon's resting orientation.
  function handleRotateStart(e) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    rotating.current = true
  }

  function handleRotateMove(e) {
    if (!rotating.current || !shapeRef.current) return
    const rect = shapeRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI - 90
    onChange({ ...item, rotation: Math.round(angle) })
  }

  function handleRotateEnd(e) {
    rotating.current = false
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
      <div
        ref={shapeRef}
        className="placed-item-shape"
        style={{ transform: `rotate(${item.rotation ?? 0}deg)` }}
      >
        {item.kind === 'vehicle' && <VehicleIcon type={item.vehicleType} />}
        {item.kind === 'sign' && <SpeedSign speed={item.speed} />}
        {item.kind === 'impact' && <ImpactIcon />}

        {/* Lives inside the rotated shape so it stays attached to "top" as the
            shape turns, like a design-tool rotate handle — bigger touch target
            than the old toolbar button, and grabbed right off the object. */}
        {selected && item.kind === 'vehicle' && (
          <div
            className="rotate-handle no-print"
            title="Drag to rotate"
            onPointerDown={handleRotateStart}
            onPointerMove={handleRotateMove}
            onPointerUp={handleRotateEnd}
          >
            <div className="rotate-handle-stem" />
          </div>
        )}
      </div>

      {item.kind === 'vehicle' && item.party && (
        <div className={`party-tag ${item.party}`}>{item.party === 'yours' ? 'Yours' : 'Other'}</div>
      )}

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
                variant={item.party === 'yours' ? 'default' : 'secondary'}
                title="Mark as your vehicle"
                onClick={() => onChange({ ...item, party: 'yours' })}
              >
                Y
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant={item.party === 'other' ? 'default' : 'secondary'}
                title="Mark as the other vehicle"
                onClick={() => onChange({ ...item, party: 'other' })}
              >
                O
              </Button>
            </>
          )}
          {item.kind === 'sign' && (
            <input
              type="number"
              min={0}
              max={200}
              className="w-14 rounded px-1.5 py-0.5 text-xs"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore
              data-bwignore
              data-form-type="other"
              value={item.speed}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') return onChange({ ...item, speed: raw })
                onChange({ ...item, speed: clamp(Number(raw), 0, 200) })
              }}
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
