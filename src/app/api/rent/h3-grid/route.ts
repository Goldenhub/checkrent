import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { H3GridQuerySchema } from "@/lib/validation";
import { cellToBoundary } from "h3-js";
import type { H3GridResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = H3GridQuerySchema.safeParse({
      north: searchParams.get("north"),
      south: searchParams.get("south"),
      east: searchParams.get("east"),
      west: searchParams.get("west"),
      resolution: searchParams.get("resolution") ?? 8,
      bedrooms: searchParams.get("bedrooms"),
      property_type: searchParams.get("property_type"),
      date_from: searchParams.get("date_from"),
      date_to: searchParams.get("date_to"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { north, south, east, west, bedrooms, property_type, date_from, date_to } = parsed.data;

    const params: unknown[] = [east, west, north, south];
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
      SELECT h3_index, AVG(annual_amount) AS avg_rent,
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_amount) AS median_rent,
             COUNT(*)::int AS sample_count
      FROM rent_submissions
      WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND h3_index IS NOT NULL
        ${bedroomFilter}
        ${propertyFilter}
        ${dateFilter}
        AND NOT is_flagged
      GROUP BY h3_index
      HAVING COUNT(*) >= 2;
    `;

    const { rows } = await pool.query(sql, params);

    const features: H3GridResponse["features"] = rows
      .map((row) => {
        const h3Index = row.h3_index as string;
        const count = row.sample_count as number;
        const confidence = count > 15 ? "high" : count > 8 ? "medium" : "low";

        let boundary;
        try {
          const raw = cellToBoundary(h3Index);
          const coords: number[][] = raw.map(([lat, lng]: [number, number]) => [lng, lat]);
          coords.push(coords[0]);
          boundary = { type: "Polygon" as const, coordinates: [coords] };
        } catch {
          return null;
        }

        return {
          type: "Feature" as const,
          properties: {
            h3_index: h3Index,
            avg_rent: Number(row.avg_rent),
            median_rent: Number(row.median_rent),
            count,
            confidence,
          },
          geometry: boundary,
        };
      })
      .filter(Boolean) as H3GridResponse["features"];

    return NextResponse.json({ type: "FeatureCollection", features } satisfies H3GridResponse);
  } catch (error) {
    console.error("H3 grid error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
