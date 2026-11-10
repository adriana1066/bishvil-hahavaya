import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/manage/login", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
