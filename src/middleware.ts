import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "~/env";

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: env.AUTH_SECRET ?? "",
  });

  const { pathname } = request.nextUrl;

  const protectedPaths = ["/overview", "/friends", "/meetups", "/reminders"];

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/friends/:path*",
    "/meetups/:path*",
    "/reminders/:path*",
  ],
};
