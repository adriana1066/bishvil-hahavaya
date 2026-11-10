import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { hasAdminSession } from "../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || (!file.type.startsWith("image/") && file.type !== "video/mp4")) return NextResponse.json({ error: "יש לבחור תמונה או סרטון MP4" }, { status: 400 });
  if (file.size > 80 * 1024 * 1024) return NextResponse.json({ error: "הקובץ גדול מדי. הגודל המרבי הוא 80MB" }, { status: 400 });
  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const key = `site/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return NextResponse.json({ url: `/api/uploads/${encodeURIComponent(key)}` });
}
