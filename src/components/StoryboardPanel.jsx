import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { staticMapUrl } from '@/lib/staticMap'
import { DraggableItem } from './DraggableItem'
import { VEHICLE_TYPES, VehicleIcon, ImpactIcon } from './icons/VehicleIcon'

const ZOOM = 19

let nextId = 1
const makeId = () => `item-${nextId++}-${Date.now()}`

export function StoryboardPanel({ title, location, items, onItemsChange }) {
  const panelRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)

  function addVehicle(vehicleType) {
    onItemsChange([
      ...items,
      { id: makeId(), kind: 'vehicle', vehicleType, rotation: 0, x: 50, y: 50 },
    ])
  }

  function addSign() {
    onItemsChange([...items, { id: makeId(), kind: 'sign', speed: 30, x: 50, y: 20 }])
  }

  function addImpact() {
    onItemsChange([...items, { id: makeId(), kind: 'impact', x: 50, y: 50 }])
  }

  function updateItem(updated) {
    onItemsChange(items.map((it) => (it.id === updated.id ? updated : it)))
  }

  function deleteItem(id) {
    onItemsChange(items.filter((it) => it.id !== id))
    setSelectedId(null)
  }

  return (
    <div className="storyboard-panel flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="panel-toolbar no-print flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1">
        {VEHICLE_TYPES.map((v) => (
          <Button
            key={v.type}
            type="button"
            variant="outline"
            size="sm"
            title={`Add ${v.label}`}
            className="h-auto flex-col gap-0.5 px-1.5 py-1 text-[10px] text-muted-foreground"
            onClick={() => addVehicle(v.type)}
          >
            <VehicleIcon type={v.type} />
            <span>{v.label}</span>
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" className="text-[11px]" onClick={addSign}>
          + Speed
        </Button>
        <Button type="button" variant="outline" size="sm" title="Add impact point" onClick={addImpact}>
          <ImpactIcon />
        </Button>
      </div>

      <div className="panel-title border-b border-border bg-muted p-1 text-center text-[13px] font-semibold">
        {title}
      </div>

      <div className="panel-map" ref={panelRef}>
        {location ? (
          <img
            className="panel-map-img"
            src={staticMapUrl(location, ZOOM)}
            alt=""
            draggable={false}
          />
        ) : (
          <div className="panel-map-placeholder flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
            Set a location above
          </div>
        )}

        <div className="panel-overlay" onPointerDown={() => setSelectedId(null)}>
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              panelRef={panelRef}
              selected={item.id === selectedId}
              onChange={updateItem}
              onSelect={setSelectedId}
              onDelete={deleteItem}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
