import { useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { DraggableItem } from './DraggableItem'
import { RecenterMap } from './RecenterMap'
import { VEHICLE_TYPES, VehicleIcon, ImpactIcon } from './icons/VehicleIcon'

// The tile server's real max zoom is 19 (z20 requests 400) — going past that
// relies on Leaflet's built-in over-zoom, which upscales the z19 tiles
// client-side (softer image, but the requested tighter framing).
const NATIVE_MAX_ZOOM = 19
const ZOOM = 20

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
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={ZOOM}
            maxZoom={ZOOM}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={NATIVE_MAX_ZOOM}
              maxZoom={ZOOM}
            />
            <RecenterMap lat={location.lat} lng={location.lng} />
          </MapContainer>
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
