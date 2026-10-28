import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await readSessionToken(token);

  if (pathname === "/admin/login") {
    if (!valid) return clearCookie(NextResponse.next(), Boolean(token));
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (valid) return NextResponse.next();
  return clearCookie(NextResponse.redirect(new URL("/admin/login", request.url)), Boolean(token));
}

function clearCookie(response: NextResponse, hadToken: boolean) {
  if (hadToken) {
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
