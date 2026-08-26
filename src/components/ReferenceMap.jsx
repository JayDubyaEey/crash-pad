import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { RecenterMap } from './RecenterMap'
import { markerIcon } from '../lib/leafletIcon'

const ZOOM = 18

// Wider-context overview for the report's first page — pin included, less
// tightly zoomed than the storyboard panels which focus on vehicle placement.
export function ReferenceMap({ location }) {
  if (!location) return null
  return (
    <div className="reference-map">
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
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} />
        <Marker position={[location.lat, location.lng]} icon={markerIcon} />
        <RecenterMap lat={location.lat} lng={location.lng} />
      </MapContainer>
    </div>
  )
}
