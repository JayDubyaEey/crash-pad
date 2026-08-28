// Vehicle lookup via a Cloudflare Worker that proxies the DVLA Vehicle
// Enquiry API (the DVLA key stays server-side in the worker, never in this
// bundle). Worker only allows the deployed GitHub Pages origin, so this call
// gets CORS-blocked from localhost/other origins — expected in local dev.
const WORKER_URL = 'https://dvla-proxy.jaydubyaeey.workers.dev/'

export async function lookupVehicle(reg) {
  const registrationNumber = reg.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  if (!registrationNumber) throw new Error('Enter a registration first')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationNumber }),
  })

  if (res.status === 404) throw new Error('Vehicle not found')
  if (!res.ok) throw new Error('Lookup failed')

  return res.json()
}
