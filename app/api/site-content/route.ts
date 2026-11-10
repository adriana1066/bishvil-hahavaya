import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../lib/admin-auth";
import { getSiteContent, saveSiteContent } from "../../../lib/content-store";
import type { SiteContent } from "../../../lib/site-content";

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  const content = await request.json() as SiteContent;
  await saveSiteContent(content);
  return NextResponse.json({ ok: true });
}
