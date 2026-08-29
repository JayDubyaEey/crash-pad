import { useEffect, useState } from 'react'
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { geocode } from '../lib/geocode'

// This is a browser key, restricted by HTTP referrer in the Google Cloud
// console to this site's domain — unlike the DVLA/geocoding keys, Google's
// Maps JavaScript API is designed to be loaded client-side and can't be
// proxied, so referrer restriction (not secrecy) is what protects it.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Business/POI pins and labels are noise on an accident diagram — just the
// road layout is needed.
const MAP_STYLES = [
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
]

// `Map` only reads center/zoom once (as `default*`) — it manages its own
// camera after that, so panning/zooming isn't fought on every re-render.
// This nudges the camera back only when `location` itself changes (a search
// pick, not the user panning around).
function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map?.setCenter({ lat, lng })
  }, [lat, lng, map])
  return null
}

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
    <div className="location-picker flex flex-col gap-2">
      <div className="no-print flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground">Location</Label>
        <form onSubmit={handleSearch} className="flex gap-2">
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
          <ul className="list-none overflow-hidden rounded-lg border border-border p-0">
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

      {location && (
        <div className="field-card flex flex-col gap-1 rounded-lg border border-border p-3">
          <Label className="text-xs font-medium text-muted-foreground">Location</Label>
          <div className="text-sm text-foreground">
            {location.address}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        {location && (
          <Map
            className="picker-map"
            defaultCenter={{ lat: location.lat, lng: location.lng }}
            defaultZoom={18}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            styles={MAP_STYLES}
            onClick={(e) => {
              if (!e.detail.latLng) return
              onLocationChange({ ...location, lat: e.detail.latLng.lat, lng: e.detail.latLng.lng })
            }}
          >
            <RecenterMap lat={location.lat} lng={location.lng} />
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
