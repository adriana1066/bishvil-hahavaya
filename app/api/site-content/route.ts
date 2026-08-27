import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getSiteContent, saveSiteContent } from "../../../lib/content-store";
import type { SiteContent } from "../../../lib/site-content";

const ADMIN_EMAIL = "harel.a.d@gmail.com";

export async function GET() { return NextResponse.json(await getSiteContent()); }

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) return NextResponse.json({error:"אין הרשאה"},{status:403});
  const content = await request.json() as SiteContent;
  await saveSiteContent(content);
  return NextResponse.json({ok:true});
}
