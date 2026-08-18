import { NextResponse } from "next/server";
import { getRentStats, getIDWPoints } from "@/lib/stats";
import { idwInterpolation } from "@/lib/interpolation";
import { StatsQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = StatsQuerySchema.safeParse({
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
      radius_km: searchParams.get("radius_km") ?? 1.5,
      bedrooms: searchParams.get("bedrooms"),
      property_type: searchParams.get("property_type"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { lat, lng, radius_km, bedrooms, property_type } = parsed.data;

    const [stats, idwPoints] = await Promise.all([
      getRentStats(lat, lng, radius_km, bedrooms, property_type),
      getIDWPoints(lat, lng, radius_km, bedrooms, property_type),
    ]);

    const idwEstimate = idwInterpolation(idwPoints, lat, lng);

    return NextResponse.json({
      ...stats,
      idw_estimate: idwEstimate ? Math.round(idwEstimate) : null,
      filters: { bedrooms: bedrooms ?? null, property_type: property_type ?? null },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
