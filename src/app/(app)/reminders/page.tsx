"use client";

import { addDays } from "date-fns";
import { useSession } from "next-auth/react";
import { FriendCard } from "~/components/figma/friend-card";
import { api } from "~/trpc/react";

export default function RemindersPage() {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: friends = [], isLoading } = api.friends.getAll.useQuery(
		{ userId: userId ?? "" },
		{ enabled: !!userId },
	);

	const { overdue, upcoming } = (() => {
		const now = new Date();
		const withNext = friends.map((f) => {
			const base = f.lastContact ?? f.createdAt;
			const nextReminder = addDays(new Date(base), f.reminderDays);
			return { friend: f, nextReminder, isOverdue: nextReminder < now };
		});

		const overdue = withNext
			.filter((x) => x.isOverdue)
			.sort((a, b) => a.nextReminder.getTime() - b.nextReminder.getTime())
			.map((x) => x.friend);

		const upcoming = withNext
			.filter((x) => !x.isOverdue)
			.sort((a, b) => a.nextReminder.getTime() - b.nextReminder.getTime())
			.map((x) => x.friend);

		return { overdue, upcoming };
	})();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-4 font-semibold text-2xl">Reminders</h2>
			</div>

			{isLoading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : (
				<>
					{overdue.length > 0 && (
						<div>
							<h3 className="mb-3 font-medium text-destructive">
								Overdue ({overdue.length})
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								{overdue.map((f) => (
									<FriendCard friend={f} key={f.id} />
								))}
							</div>
						</div>
					)}

					{upcoming.length > 0 && (
						<div>
							<h3 className="mb-3 font-medium">Upcoming</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								{upcoming.map((f) => (
									<FriendCard friend={f} key={f.id} />
								))}
							</div>
						</div>
					)}

					{overdue.length === 0 && upcoming.length === 0 && (
						<div className="py-12 text-center text-muted-foreground">
							No reminders yet. Add friends and log meetups to start tracking!
						</div>
					)}
				</>
			)}
		</div>
	);
}
