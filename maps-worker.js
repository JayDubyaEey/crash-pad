export default {
  async fetch(request, env) {
    const allowedOrigin = "https://jaydubyaeey.github.io";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/geocode" && request.method === "POST") {
      return handleGeocode(request, env, corsHeaders);
    }

    if (url.pathname === "/static-map" && request.method === "GET") {
      return handleStaticMap(url, env, corsHeaders);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};

async function handleGeocode(request, env, corsHeaders) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const googleUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    googleUrl.searchParams.set("address", query);
    googleUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

    const googleResponse = await fetch(googleUrl);
    const raw = await googleResponse.text();

    return new Response(raw, {
      status: googleResponse.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

// Business/POI pins and labels are noise on an accident diagram — just the
// road layout is needed. Mirrors the JS Maps `styles` array on the
// interactive picker, just in Static Maps' flat `style` param syntax.
const STATIC_MAP_STYLES = [
  "feature:poi|visibility:off",
  "feature:transit|visibility:off",
];

async function handleStaticMap(url, env, corsHeaders) {
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  const zoom = url.searchParams.get("zoom") || "18";
  const size = url.searchParams.get("size") || "640x400";

  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return new Response(JSON.stringify({ error: "Missing or invalid lat/lng" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const googleUrl = new URL("https://maps.googleapis.com/maps/api/staticmap");
  googleUrl.searchParams.set("center", `${lat},${lng}`);
  googleUrl.searchParams.set("zoom", zoom);
  googleUrl.searchParams.set("size", size);
  googleUrl.searchParams.set("scale", "2");
  googleUrl.searchParams.set("maptype", "roadmap");
  for (const style of STATIC_MAP_STYLES) {
    googleUrl.searchParams.append("style", style);
  }
  googleUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const googleResponse = await fetch(googleUrl);

  return new Response(googleResponse.body, {
    status: googleResponse.status,
    headers: {
      "Content-Type": googleResponse.headers.get("Content-Type") || "image/png",
      // Same coordinates get requested repeatedly (3 storyboard panels re-render
      // on every location tweak) — cache the image so those don't rebill Google.
      "Cache-Control": "public, max-age=86400",
      ...corsHeaders,
    },
  });
}
