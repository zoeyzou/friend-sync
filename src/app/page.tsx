import type { Friend } from "generated/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  let friends: Friend[] = [];
  if (session?.user?.id) {
    // ✅ Direct Prisma (fastest for server)
    friends = await db.friend.findMany({
      where: { userId: session.user.id },
      orderBy: { lastContact: "desc" },
    });
  } else {
    redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {friends ? friends.length : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
