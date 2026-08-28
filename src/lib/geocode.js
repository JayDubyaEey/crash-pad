// Geocoding via the Cloudflare Worker at maps-proxy, which forwards to the
// Google Geocoding API with the API key kept server-side.
// Also accepts raw "lat, lng" input and skips the network call for that case.
const MAPS_PROXY_URL = 'https://maps-proxy.jaydubyaeey.workers.dev/geocode'

const COORD_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

export async function geocode(query) {
  const coordMatch = query.match(COORD_RE)
  if (coordMatch) {
    const [, lat, lng] = coordMatch
    return [{ lat: Number(lat), lng: Number(lng), label: query.trim() }]
  }

  const res = await fetch(MAPS_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)

  const data = await res.json()
  // Google returns 200 with a status field rather than an HTTP error code —
  // ZERO_RESULTS is a valid "found nothing" outcome, anything else is a
  // real failure (REQUEST_DENIED, OVER_QUERY_LIMIT, ...).
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || data.status)
  }

  return data.results.map((r) => ({
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    label: r.formatted_address,
  }))
}
