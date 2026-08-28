import { useState } from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { geocode } from '../lib/geocode'

// This is a browser key, restricted by HTTP referrer in the Google Cloud
// console to this site's domain — unlike the DVLA/geocoding keys, Google's
// Maps JavaScript API is designed to be loaded client-side and can't be
// proxied, so referrer restriction (not secrecy) is what protects it.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// This map doubles as the report's page-1 reference view, so unlike the
// no-print search controls, the map itself stays visible when printing.
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
    <div className="location-picker">
      <div className="no-print">
        <form onSubmit={handleSearch} className="mb-2 flex gap-2">
          <Input
            type="text"
            placeholder="Address, place, or 'lat, lng'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {status === 'error' && <p className="hint error text-xs text-destructive">Couldn't look that up — try again.</p>}

        {results.length > 1 && (
          <ul className="mb-2 list-none overflow-hidden rounded-lg border border-border p-0">
            {results.map((r, i) => (
              <li key={i} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  className="w-full bg-background p-2 text-left text-sm hover:bg-muted"
                  onClick={() => pick(r)}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {location && <p className="hint text-xs text-muted-foreground">Click the map to fine-tune the pin.</p>}
      </div>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        {location && (
          <Map
            className="picker-map"
            center={{ lat: location.lat, lng: location.lng }}
            zoom={18}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            onClick={(e) => {
              if (!e.detail.latLng) return
              onLocationChange({ ...location, lat: e.detail.latLng.lat, lng: e.detail.latLng.lng })
            }}
          >
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              draggable
              onDragEnd={(e) => {
                const pos = e.latLng
                if (!pos) return
                onLocationChange({ ...location, lat: pos.lat(), lng: pos.lng() })
              }}
            />
          </Map>
        )}
      </APIProvider>
    </div>
  )
}
