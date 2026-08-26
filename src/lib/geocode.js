// Geocoding via Photon (photon.komoot.io) — built on OpenStreetMap data like
// Nominatim, but actually sends Access-Control-Allow-Origin so it works from
// a browser fetch() on a static site. Nominatim's API does not set that
// header, so calling it directly from client-side JS gets silently blocked
// by CORS.
// Also accepts raw "lat, lng" input and skips the network call for that case.
const COORD_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

export async function geocode(query) {
  const coordMatch = query.match(COORD_RE)
  if (coordMatch) {
    const [, lat, lng] = coordMatch
    return [{ lat: Number(lat), lng: Number(lng), label: query.trim() }]
  }

  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const { features } = await res.json()
  return features.map((f) => ({
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    label: formatLabel(f.properties),
  }))
}

function formatLabel(p) {
  return [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ')
}
