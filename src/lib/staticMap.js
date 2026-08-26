// Static (non-interactive) OSM roadmap image for a given point — used as the
// fixed background for each storyboard panel, and for print, since a plain
// <img> always prints without needing "print background graphics" enabled.
export function buildStaticMapUrl({ lat, lng, zoom = 18, size = 500 }) {
  const url = new URL('https://staticmap.openstreetmap.de/staticmap.php')
  url.searchParams.set('center', `${lat},${lng}`)
  url.searchParams.set('zoom', String(zoom))
  url.searchParams.set('size', `${size}x${size}`)
  url.searchParams.set('markers', `${lat},${lng},red-pushpin`)
  return url.toString()
}
