import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession, verifyAdminPassword } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/manage/login?error=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/manage", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, await createAdminSession(), adminCookieOptions);
  return response;
}
