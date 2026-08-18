import { query } from "./db";
import type { RentStats, ConfidenceLevel } from "./types";

function getConfidence(count: number): ConfidenceLevel {
  if (count > 15) return "high";
  if (count > 8) return "medium";
  if (count > 0) return "low";
  return "none";
}

export async function getRentStats(
  lat: number,
  lng: number,
  radiusKm: number,
  bedrooms?: number,
  propertyType?: string
): Promise<RentStats> {
  const params: unknown[] = [lng, lat, radiusKm * 1000];
  let bedroomFilter = "";
  let propertyFilter = "";
  let paramIndex = 4;

  if (bedrooms !== undefined && bedrooms !== null) {
    bedrooms = bedrooms >= 3 ? 3 : bedrooms;
    bedroomFilter = `AND s.bedrooms = $${paramIndex}`;
    params.push(bedrooms);
    paramIndex++;
  }

  if (propertyType && propertyType !== "all") {
    propertyFilter = `AND s.property_type = $${paramIndex}`;
    params.push(propertyType);
    paramIndex++;
  }

  const sql = `
    WITH nearby AS (
      SELECT s.annual_amount, s.id
      FROM rent_submissions s
      WHERE ST_DWithin(
        s.geom::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ${bedroomFilter}
      ${propertyFilter}
      AND NOT s.is_flagged
    ),
    quartiles AS (
      SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY annual_amount) AS q1,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY annual_amount) AS q3
      FROM nearby
    ),
    filtered AS (
      SELECT n.annual_amount
      FROM nearby n, quartiles q
      WHERE n.annual_amount >= q.q1 - 1.5 * (q.q3 - q.q1)
        AND n.annual_amount <= q.q3 + 1.5 * (q.q3 - q.q1)
    )
    SELECT
      (SELECT COUNT(*) FROM nearby)::int AS original_count,
      (SELECT COUNT(*) FROM filtered)::int AS filtered_count,
      MIN(f.annual_amount) AS min_rent,
      MAX(f.annual_amount) AS max_rent,
      AVG(f.annual_amount) AS avg_rent,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY f.annual_amount) AS median_rent
    FROM filtered f;
  `;

  const { rows } = await query<{
    original_count: number;
    filtered_count: number;
    min_rent: number | null;
    max_rent: number | null;
    avg_rent: number | null;
    median_rent: number | null;
  }>(sql, params);

  const row = rows[0];
  const count = row?.filtered_count ?? 0;
  const outliersRemoved = (row?.original_count ?? 0) - count;

  return {
    min_rent: row?.min_rent ? Math.round(row.min_rent) : null,
    max_rent: row?.max_rent ? Math.round(row.max_rent) : null,
    avg_rent: row?.avg_rent ? Math.round(row.avg_rent) : null,
    median_rent: row?.median_rent ? Math.round(row.median_rent) : null,
    sample_count: count,
    confidence: getConfidence(count),
    idw_estimate: null,
    filtered_count: count,
    original_count: row?.original_count ?? 0,
    outliers_removed: outliersRemoved,
  };
}

export async function getIDWPoints(
  lat: number,
  lng: number,
  radiusKm: number,
  bedrooms?: number,
  propertyType?: string
): Promise<Array<{ lat: number; lng: number; value: number }>> {
  const params: unknown[] = [lng, lat, radiusKm * 1000];
  let bedroomFilter = "";
  let propertyFilter = "";
  let paramIndex = 4;

  if (bedrooms !== undefined && bedrooms !== null) {
    bedrooms = bedrooms >= 3 ? 3 : bedrooms;
    bedroomFilter = `AND bedrooms = $${paramIndex}`;
    params.push(bedrooms);
    paramIndex++;
  }

  if (propertyType && propertyType !== "all") {
    propertyFilter = `AND property_type = $${paramIndex}`;
    params.push(propertyType);
    paramIndex++;
  }

  const sql = `
    SELECT
      ST_Y(geom::geometry) AS lat,
      ST_X(geom::geometry) AS lng,
      annual_amount AS value
    FROM rent_submissions
    WHERE ST_DWithin(
      geom::geography,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      $3
    )
    ${bedroomFilter}
    ${propertyFilter}
    AND NOT is_flagged;
  `;

  const { rows } = await query<{ lat: number; lng: number; value: number }>(sql, params);
  return rows;
}
