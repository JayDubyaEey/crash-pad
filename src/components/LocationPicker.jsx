import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { geocode } from '../lib/geocode'
import { markerIcon } from '../lib/leafletIcon'
import { RecenterMap } from './RecenterMap'

function ClickToMove({ onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ location, onLocationChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | error

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('loading')
    try {
      const found = await geocode(query)
      setResults(found)
      setStatus('idle')
      if (found.length === 1) {
        onLocationChange({ lat: found[0].lat, lng: found[0].lng, address: found[0].label })
      }
    } catch {
      setStatus('error')
    }
  }

  function pick(result) {
    onLocationChange({ lat: result.lat, lng: result.lng, address: result.label })
    setResults([])
  }

  return (
    <div className="location-picker no-print">
      <form onSubmit={handleSearch} className="location-search">
        <input
          type="text"
          placeholder="Address, place, or 'lat, lng'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {status === 'error' && <p className="hint error">Couldn't look that up — try again.</p>}

      {results.length > 1 && (
        <ul className="location-results">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" onClick={() => pick(r)}>
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {location && (
        <>
          <p className="hint">Click the map to fine-tune the pin.</p>
          <MapContainer center={[location.lat, location.lng]} zoom={19} maxZoom={19} style={{ height: 260 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[location.lat, location.lng]}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  onLocationChange({ ...location, lat, lng })
                },
              }}
            />
            <ClickToMove onMove={(lat, lng) => onLocationChange({ ...location, lat, lng })} />
            <RecenterMap lat={location.lat} lng={location.lng} />
          </MapContainer>
        </>
      )}
    </div>
  )
}
