// The storyboard panels are non-interactive backgrounds, so a Google Static
// Maps image (proxied through the same worker as geocode, key kept
// server-side) is cheaper and prints far more reliably than an embedded JS
// map would.
const MAPS_PROXY_URL = 'https://maps-proxy.jaydubyaeey.workers.dev/static-map'

export function staticMapUrl({ lat, lng }, zoom, size = '640x400') {
  const params = new URLSearchParams({ lat, lng, zoom, size })
  return `${MAPS_PROXY_URL}?${params}`
}
