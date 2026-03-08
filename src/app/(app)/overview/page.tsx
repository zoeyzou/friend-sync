"use client";

import { addDays } from "date-fns";
import { useSession } from "next-auth/react";
import { FriendCard } from "~/entities/friend";
import { MeetupCard } from "~/entities/meeting";
import { OverviewStats } from "~/components/figma/overview-stats";
import { getNextReminderDate, isOverdue } from "~/lib/reminder-utils";
import { api } from "~/trpc/react";

export default function OverviewPage() {
	const utils = api.useUtils();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: stats } = api.reminders.stats.useQuery();
	const { data: friends = [] } = api.friends.getAll.useQuery(
		{ userId: userId ?? "" },
		{ enabled: !!userId },
	);

	const { data: recentMeetups = [] } = api.meetings.getAll.useQuery({
		take: 5,
	});
	const deleteMeetup = api.meetings.delete.useMutation({
		onSuccess: async () => {
			await utils.meetings.getAll.invalidate();
			await utils.friends.getAll.invalidate();
			await utils.reminders.stats.invalidate();
		},
	});

	const computed = (() => {
		const now = new Date();
		const withNext = friends.map((friend) => {
			const nextReminder = getNextReminderDate(friend);
			return { friend, nextReminder, isOverdue: isOverdue(friend, now) };
		});

		const overdueFriends = withNext
			.filter((entry) => entry.isOverdue)
			.sort(
				(a, b) => a.nextReminder.getTime() - b.nextReminder.getTime(),
			)
			.map((entry) => entry.friend);

		const upcoming7 = withNext.filter(
			(entry) =>
				!entry.isOverdue &&
				entry.nextReminder <= addDays(now, 7),
		).length;

		return { upcoming7, overdueFriends };
	})();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-4 font-semibold text-2xl">Overview</h2>
				<OverviewStats
					meetupsThisMonth={stats?.meetupsLast30Days ?? 0}
					totalFriends={stats?.totalFriends ?? 0}
					totalMeetups={stats?.totalMeetups ?? 0}
					upcomingReminders={computed.overdueFriends.length}
				/>
			</div>

			{/* Overdue Reminders */}
			{computed.overdueFriends.length > 0 && (
				<div>
					<h3 className="mb-3 font-medium text-destructive">
						Overdue Reminders
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{computed.overdueFriends.slice(0, 4).map((f) => (
							<FriendCard friend={f} key={f.id} />
						))}
					</div>
				</div>
			)}

			{/* Recent Meetups */}
			<div>
				<h3 className="mb-3 font-medium">Recent Meetups</h3>
				<div className="space-y-3">
					{recentMeetups.slice(0, 5).map((m) => (
						<MeetupCard
							key={m.id}
							meetup={m}
							onDelete={(id) => deleteMeetup.mutate({ id })}
						/>
					))}
					{recentMeetups.length === 0 && (
						<p className="py-8 text-center text-muted-foreground">
							No meetups logged yet. Start by logging your first meetup!
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
