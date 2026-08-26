import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

// MapContainer only reads center/zoom on first mount (it's uncontrolled) —
// this keeps the view synced whenever the location changes afterward.
export function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}
