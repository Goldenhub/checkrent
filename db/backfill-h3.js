const { latLngToCell } = require("h3-js");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const { rows } = await pool.query(
    "SELECT id, ST_Y(geom) as lat, ST_X(geom) as lng FROM rent_submissions WHERE h3_index IS NULL"
  );

  if (rows.length === 0) {
    console.log("All rows already have h3_index");
    await pool.end();
    return;
  }

  for (const row of rows) {
    const h3 = latLngToCell(parseFloat(row.lat), parseFloat(row.lng), 8);
    await pool.query("UPDATE rent_submissions SET h3_index = $1 WHERE id = $2", [h3, row.id]);
  }

  console.log(`Backfilled ${rows.length} rows with h3_index`);
  await pool.end();
})().catch((e) => {
  console.error("H3 backfill failed:", e.message);
  process.exit(1);
});
