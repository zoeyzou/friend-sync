"use client";
import { Users } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
	useEffect(() => {
		getSession().then((session) => {
			if (session) window.location.href = "/overview";
		});
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Users className="h-8 w-8 text-primary" />
					</div>
					<h1 className="mb-2 font-semibold text-3xl">
						Welcome to FriendTrack
					</h1>
					<p className="text-muted-foreground">
						Track your meetups and stay connected
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-6 sm:p-8">
					<h2 className="mb-6 font-semibold text-2xl">Sign In</h2>

					<button
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
						onClick={() => signIn("discord", { callbackUrl: "/overview" })}
						type="button"
					>
						Continue with Discord
					</button>
				</div>
			</div>
		</div>
	);
}
