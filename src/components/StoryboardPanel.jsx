import { useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DraggableItem } from './DraggableItem'
import { RecenterMap } from './RecenterMap'
import { VEHICLE_TYPES, VehicleIcon, ImpactIcon } from './icons/VehicleIcon'
import { markerIcon } from '../lib/leafletIcon'

const ZOOM = 18

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
    <div className="storyboard-panel">
      <div className="panel-toolbar no-print">
        {VEHICLE_TYPES.map((v) => (
          <button key={v.type} type="button" title={`Add ${v.label}`} onClick={() => addVehicle(v.type)}>
            <VehicleIcon type={v.type} />
          </button>
        ))}
        <button type="button" className="add-sign-btn" onClick={addSign}>
          + Speed
        </button>
        <button type="button" title="Add impact point" onClick={addImpact}>
          <ImpactIcon />
        </button>
      </div>

      <div className="panel-title">{title}</div>

      <div className="panel-map" ref={panelRef}>
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={ZOOM}
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
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.lat, location.lng]} icon={markerIcon} />
            <RecenterMap lat={location.lat} lng={location.lng} />
          </MapContainer>
        ) : (
          <div className="panel-map-placeholder">Set a location above</div>
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
