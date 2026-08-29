import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { staticMapUrl } from '@/lib/staticMap'
import { DraggableItem } from './DraggableItem'
import { VEHICLE_TYPES, ImpactIcon, SpeedSign } from './icons/VehicleIcon'

const ZOOM = 19
const ICON_SIZE = 20
const TOOL_BUTTON_CLASS =
  'h-auto w-14 flex-col items-center gap-0.5 px-1 py-1 text-[10px] text-muted-foreground'

let nextId = 1
const makeId = () => `item-${nextId++}-${Date.now()}`

export function StoryboardPanel({ title, description, location, items, onItemsChange, onCopyToNext }) {
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
            className={TOOL_BUTTON_CLASS}
            onClick={() => addVehicle(v.type)}
          >
            <v.picker size={ICON_SIZE} color={v.color} strokeWidth={2} />
            <span>{v.label}</span>
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Add speed sign"
          className={TOOL_BUTTON_CLASS}
          onClick={addSign}
        >
          <SpeedSign speed={30} size={ICON_SIZE} />
          <span>Speed</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Add impact point"
          className={TOOL_BUTTON_CLASS}
          onClick={addImpact}
        >
          <ImpactIcon size={ICON_SIZE} />
          <span>Impact</span>
        </Button>
        {onCopyToNext && items.length > 0 && (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="ml-auto h-auto self-stretch text-[11px]"
            onClick={onCopyToNext}
          >
            Copy to next →
          </Button>
        )}
      </div>

      <div className="panel-title border-b border-border bg-muted px-1 py-1.5 text-center">
        <div className="text-[13px] font-semibold">{title}</div>
        {description && <div className="text-[10px] text-muted-foreground">{description}</div>}
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
