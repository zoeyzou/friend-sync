import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieNames = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
  const secretSource =
    process.env.AUTH_SECRET != null
      ? "AUTH_SECRET"
      : process.env.NEXTAUTH_SECRET != null
        ? "NEXTAUTH_SECRET"
        : "missing";

  let tokenPresent = false;
  let tokenError: string | null = null;

  try {
    const token = await getToken({
      req: request as unknown as Parameters<typeof getToken>[0]["req"],
      secret,
    });
    tokenPresent = !!token;
  } catch (error) {
    tokenError = error instanceof Error ? error.message : "unknown";
  }

  return NextResponse.json({
    url: request.url,
    cookieNames,
    secretSource,
    hasSecret: secret.length > 0,
    tokenPresent,
    tokenError,
  });
}
