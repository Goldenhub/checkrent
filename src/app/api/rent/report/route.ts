import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ReportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ReportSchema.parse(body);

    const { rowCount } = await pool.query(
      `UPDATE rent_submissions
       SET flag_count = flag_count + 1,
           is_flagged = CASE WHEN flag_count + 1 >= 5 THEN TRUE ELSE is_flagged END
       WHERE id = $1`,
      [parsed.submission_id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }
    console.error("Report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
