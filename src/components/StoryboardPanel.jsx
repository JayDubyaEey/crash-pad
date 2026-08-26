import { useRef, useState } from 'react'
import { DraggableItem } from './DraggableItem'
import { VEHICLE_TYPES, VehicleIcon } from './icons/VehicleIcon'

let nextId = 1
const makeId = () => `item-${nextId++}-${Date.now()}`

export function StoryboardPanel({ title, mapUrl, items, onItemsChange }) {
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
      </div>

      <div className="panel-title">{title}</div>

      <div className="panel-map" ref={panelRef} onPointerDown={() => setSelectedId(null)}>
        {mapUrl ? (
          <img className="panel-map-img" src={mapUrl} alt={`Map for ${title}`} draggable={false} />
        ) : (
          <div className="panel-map-placeholder">Set a location above</div>
        )}
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
  )
}
