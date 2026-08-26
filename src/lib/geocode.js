// Free geocoding via OpenStreetMap's Nominatim search API. No API key.
// Also accepts raw "lat, lng" input and skips the network call for that case.
const COORD_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

export async function geocode(query) {
  const coordMatch = query.match(COORD_RE)
  if (coordMatch) {
    const [, lat, lng] = coordMatch
    return [{ lat: Number(lat), lng: Number(lng), label: query.trim() }]
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const results = await res.json()
  return results.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    label: r.display_name,
  }))
}
