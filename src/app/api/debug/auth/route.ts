import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "~/env";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieNames = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);

  const secret = env.AUTH_SECRET ?? "";
  const secretSource = "AUTH_SECRET";

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
