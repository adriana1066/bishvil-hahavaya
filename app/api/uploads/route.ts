import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

const ADMIN_EMAIL = "harel.a.d@gmail.com";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) return NextResponse.json({error:"אין הרשאה"},{status:403});
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({error:"יש לבחור תמונה"},{status:400});
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({error:"התמונה גדולה מדי"},{status:400});
  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g,"") || "jpg";
  const key = `site/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, file.stream(), {httpMetadata:{contentType:file.type}});
  return NextResponse.json({url:`/api/uploads/${encodeURIComponent(key)}`});
}
