import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

function extractContext(item: Record<string, unknown>): Array<{ id: string; text: string }> {
  const addr = (item.address ?? {}) as Record<string, string>;
  const ctx: Array<{ id: string; text: string }> = [];

  if (addr.city) ctx.push({ id: "place", text: addr.city });
  if (addr.town) ctx.push({ id: "place", text: addr.town });
  if (addr.village) ctx.push({ id: "place", text: addr.village });
  if (addr.neighbourhood || addr.neighborhood) {
    ctx.push({ id: "neighborhood", text: addr.neighbourhood || addr.neighborhood });
  }
  if (addr.state) ctx.push({ id: "region", text: addr.state });
  if (addr.country) ctx.push({ id: "country", text: addr.country });

  return ctx;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!action || !["search", "reverse"].includes(action)) {
    return NextResponse.json({ error: "Missing ?action=search|reverse" }, { status: 400 });
  }

  const params = new URLSearchParams();

  if (action === "search") {
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });
    params.set("q", q);
    params.set("format", "json");
    params.set("limit", searchParams.get("limit") ?? "5");
    params.set("addressdetails", "1");
    const proximity = searchParams.get("proximity");
    if (proximity) {
      const [lng, lat] = proximity.split(",").map(Number);
      params.set("viewbox", `${lng - 1},${lat - 1},${lng + 1},${lat + 1}`);
      params.set("bounded", "0");
    }
  } else {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) return NextResponse.json({ error: "Missing ?lat=&lon=" }, { status: 400 });
    params.set("lat", lat);
    params.set("lon", lon);
    params.set("format", "json");
    params.set("addressdetails", "1");
  }

  const res = await fetch(`${NOMINATIM_URL}/${action}?${params}`, {
    headers: { "User-Agent": "checkRent/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Nominatim error" }, { status: 502 });
  }

  const data = await res.json();

  if (action === "search") {
    const features = data.map((item: Record<string, unknown>) => ({
      id: String(item.place_id),
      place_name: item.display_name,
      center: [parseFloat(String(item.lon)), parseFloat(String(item.lat))],
      properties: item.address ?? {},
      context: extractContext(item),
    }));
    return NextResponse.json(features);
  }

  return NextResponse.json({
    id: String(data.place_id),
    place_name: data.display_name,
    center: [parseFloat(String(data.lon)), parseFloat(String(data.lat))],
    properties: data.address ?? {},
    context: extractContext(data),
  });
}
