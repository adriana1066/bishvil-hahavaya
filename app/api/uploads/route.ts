import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../lib/admin-auth";

export async function POST() {
  if (!(await hasAdminSession()))
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  return NextResponse.json(
    { error: "העלאת קבצים ישירה אינה מופעלת במערכת הקיימת" },
    { status: 503 },
  );
}
