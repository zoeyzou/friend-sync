"use client";

import { Bell, Calendar, LayoutGrid, LogOut, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { AddFriendDialog } from "~/features/add-friend";
import { LogMeetupDialog } from "~/features/log-meetup";
import { isOverdue } from "~/lib/reminder-utils";
import { DashboardActionsProvider } from "~/shared/lib/dashboard-actions";
import { api } from "~/trpc/react";

type TabKey = "overview" | "friends" | "meetups" | "reminders";

const navItems: Array<{
	key: TabKey;
	href: `/${string}`;
	label: string;
	Icon: typeof LayoutGrid;
}> = [
	{ key: "overview", href: "/overview", label: "Overview", Icon: LayoutGrid },
	{ key: "friends", href: "/friends", label: "Friends", Icon: Users },
	{ key: "meetups", href: "/meetups", label: "Meetups", Icon: Calendar },
	{ key: "reminders", href: "/reminders", label: "Reminders", Icon: Bell },
];

function isActivePath(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: session } = useSession();

	const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
	const [isLogMeetupOpen, setIsLogMeetupOpen] = useState(false);
	const [logMeetupFriendId, setLogMeetupFriendId] = useState<string | null>(
		null,
	);

	const userId = session?.user?.id;
	const utils = api.useUtils();

	const { data: friends = [] } = api.friends.getAll.useQuery(
		{ userId: userId ?? "" },
		{ enabled: !!userId },
	);

	const overdueCount = useMemo(() => {
		const now = new Date();
		return friends.filter((friend) => isOverdue(friend, now)).length;
	}, [friends]);

	return (
		<DashboardActionsProvider
			value={{
				openAddFriend: () => setIsAddFriendOpen(true),
				openLogMeetup: (friendId) => {
					setLogMeetupFriendId(friendId ?? null);
					setIsLogMeetupOpen(true);
				},
			}}
		>
			<div className="min-h-screen bg-background">
				<header className="sticky top-0 z-40 border-border border-b bg-card">
					<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="flex items-center gap-2 font-semibold tracking-tight">
									<Users className="h-6 w-6" />
									FriendTrack
								</h1>
								{session?.user?.name && (
									<p className="mt-1 text-muted-foreground text-sm">
										Welcome, {session.user.name}
									</p>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button
									className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-4"
									onClick={() => setIsAddFriendOpen(true)}
									type="button"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden sm:inline">Add Friend</span>
								</button>
								<button
									className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
									onClick={() => setIsLogMeetupOpen(true)}
									type="button"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden sm:inline">Log Meetup</span>
								</button>
								<button
									className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
									onClick={() => signOut({ callbackUrl: "/auth/signin" })}
									title="Sign out"
									type="button"
								>
									<LogOut className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				</header>

				<nav className="sticky top-[73px] z-30 border-border border-b bg-card lg:hidden">
					<div className="flex">
						{navItems.map(({ key, href, label, Icon }) => {
							const active = isActivePath(pathname, href);
							return (
								<Link
									className={`relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
										active
											? "border-primary border-b-2 text-primary"
											: "text-muted-foreground"
									}`}
									href={href}
									key={key}
								>
									<Icon className="h-5 w-5" />
									<span className="text-xs">{label}</span>
									{key === "reminders" && overdueCount > 0 && !active && (
										<span className="absolute top-2 right-1/4 h-2 w-2 rounded-full bg-destructive" />
									)}
								</Link>
							);
						})}
					</div>
				</nav>

				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
					<div className="lg:grid lg:grid-cols-12 lg:gap-8">
						<aside className="hidden space-y-2 lg:col-span-3 lg:block">
							{navItems.map(({ key, href, label, Icon }) => {
								const active = isActivePath(pathname, href);
								return (
									<Link
										className={`relative flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
											active
												? "bg-primary text-primary-foreground"
												: "hover:bg-accent"
										}`}
										href={href}
										key={key}
									>
										<Icon className="h-5 w-5" />
										{label}
										{key === "reminders" && overdueCount > 0 && (
											<span
												className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
													active
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-destructive text-destructive-foreground"
												}`}
											>
												{overdueCount}
											</span>
										)}
									</Link>
								);
							})}
						</aside>

						<main className="lg:col-span-9">{children}</main>
					</div>
				</div>

				<AddFriendDialog
					isOpen={isAddFriendOpen}
					onClose={() => setIsAddFriendOpen(false)}
					// Keep dashboard lists and stats in sync whenever friends change.
					onCreated={async () => {
						await utils.friends.getAll.invalidate();
						await utils.reminders.stats.invalidate();
					}}
				/>

				<LogMeetupDialog
					friends={friends}
					isOpen={isLogMeetupOpen}
					onClose={() => {
						setIsLogMeetupOpen(false);
						setLogMeetupFriendId(null);
					}}
					onCreated={async () => {
						await utils.friends.getAll.invalidate();
						await utils.meetings.getAll.invalidate();
						await utils.reminders.stats.invalidate();
					}}
					selectedFriendId={logMeetupFriendId}
				/>
			</div>
		</DashboardActionsProvider>
	);
}
