import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { toH3 } from "@/lib/h3";
import { SubmitSchema, annualizeAmount } from "@/lib/validation";
import type { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SubmitSchema.parse(body);

    const h3Index = toH3(parsed.lat, parsed.lng);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { rows: rateRows } = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM rate_limits
       WHERE h3_index = $1
         AND device_fingerprint = $2
         AND submitted_at >= $3`,
      [h3Index, parsed.device_fingerprint, monthStart.toISOString()]
    );

    if (rateRows[0].cnt > 0) {
      return NextResponse.json(
        { error: "Rate limit exceeded. One submission per area per month." },
        { status: 429 }
      );
    }

    const annualAmount = annualizeAmount(parsed.amount, parsed.frequency);

    const { rows } = await pool.query(
      `INSERT INTO rent_submissions
        (city, neighborhood, formatted_address, annual_amount, currency, frequency,
         raw_amount, property_type, bedrooms, bathrooms, h3_index, geom)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,ST_SetSRID(ST_MakePoint($13,$12),4326))
       RETURNING id`,
      [
        parsed.city,
        parsed.neighborhood || null,
        parsed.formatted_address || null,
        annualAmount,
        parsed.currency,
        parsed.frequency,
        parsed.amount,
        parsed.property_type,
        parsed.bedrooms,
        parsed.bathrooms,
        h3Index,
        parsed.lat,
        parsed.lng,
      ]
    );

    await pool.query(
      `INSERT INTO rate_limits (device_fingerprint, h3_index, submitted_at)
       VALUES ($1, $2, NOW())`,
      [parsed.device_fingerprint, h3Index]
    );

    return NextResponse.json({ id: rows[0].id, success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return NextResponse.json(
        { error: "Validation failed", details: zodError.issues },
        { status: 400 }
      );
    }
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
