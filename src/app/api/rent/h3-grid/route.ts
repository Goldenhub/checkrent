import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { H3GridQuerySchema } from "@/lib/validation";
import { latLngToCell, cellToBoundary } from "h3-js";
import type { H3GridResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {
      north: searchParams.get("north") ?? "",
      south: searchParams.get("south") ?? "",
      east: searchParams.get("east") ?? "",
      west: searchParams.get("west") ?? "",
    };
    if (searchParams.get("resolution")) rawParams.resolution = searchParams.get("resolution")!;
    if (searchParams.get("bedrooms")) rawParams.bedrooms = searchParams.get("bedrooms")!;
    if (searchParams.get("property_type")) rawParams.property_type = searchParams.get("property_type")!;
    if (searchParams.get("date_from")) rawParams.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) rawParams.date_to = searchParams.get("date_to")!;

    const parsed = H3GridQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { north, south, east, west, bedrooms, property_type, date_from, date_to } = parsed.data;
    const resolution = (parsed.data as Record<string, unknown> & { resolution?: number }).resolution ?? 8;

    const params: unknown[] = [west, south, east, north];
    let paramIndex = 5;
    let bedroomFilter = "";
    let propertyFilter = "";
    let dateFilter = "";

    if (bedrooms !== undefined && bedrooms !== null) {
      const b = bedrooms >= 3 ? 3 : bedrooms;
      bedroomFilter = `AND bedrooms = $${paramIndex}`;
      params.push(b);
      paramIndex++;
    }

    if (property_type && property_type !== "all") {
      propertyFilter = `AND property_type = $${paramIndex}`;
      params.push(property_type);
      paramIndex++;
    }

    if (date_from) {
      dateFilter = `AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      dateFilter += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    const sql = `
      SELECT COALESCE(h3_index, '') AS h3_index,
             annual_amount,
             ST_Y(geom) AS lat,
             ST_X(geom) AS lng
      FROM rent_submissions
      WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ${bedroomFilter}
        ${propertyFilter}
        ${dateFilter}
        AND NOT is_flagged;
    `;

    const { rows } = await pool.query(sql, params);

    const groups = new Map<string, { rents: number[]; h3: string }>();

    for (const row of rows) {
      let h3Index = row.h3_index as string;
      if (!h3Index) {
        try {
          h3Index = latLngToCell(Number(row.lat), Number(row.lng), resolution);
        } catch {
          continue;
        }
      }
      if (!groups.has(h3Index)) {
        groups.set(h3Index, { rents: [], h3: h3Index });
      }
      groups.get(h3Index)!.rents.push(Number(row.annual_amount));
    }

    const features: H3GridResponse["features"] = [];
    for (const { rents, h3: h3Index } of groups.values()) {
      if (rents.length === 0) continue;
      const count = rents.length;
      const confidence = count > 15 ? "high" : count > 8 ? "medium" : "low";
      const avg = rents.reduce((a, b) => a + b, 0) / count;
      const sorted = [...rents].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      let boundary;
      try {
        const raw = cellToBoundary(h3Index);
        const coords: number[][] = raw.map(([lat, lng]: [number, number]) => [lng, lat]);
        coords.push(coords[0]);
        boundary = { type: "Polygon" as const, coordinates: [coords] };
      } catch {
        continue;
      }

      features.push({
        type: "Feature",
        properties: {
          h3_index: h3Index,
          avg_rent: Math.round(avg),
          median_rent: Math.round(median),
          count,
          confidence,
        },
        geometry: boundary,
      });
    }

    return NextResponse.json({ type: "FeatureCollection", features } satisfies H3GridResponse);
  } catch (error) {
    console.error("H3 grid error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
