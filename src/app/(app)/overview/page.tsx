"use client";

import { useSession } from "next-auth/react";
import { FriendCard } from "~/entities/friend";
import { MeetupCard } from "~/entities/meeting";
import { OverviewStats } from "~/components/figma/overview-stats";
import { api } from "~/trpc/react";

export default function OverviewPage() {
	const utils = api.useUtils();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: stats } = api.reminders.stats.useQuery();
	const { data: overdueData } = api.reminders.overdueFriends.useQuery({
		take: 4,
		skip: 0,
	});
	const { data: recentMeetupsResult } = api.meetings.getAll.useQuery({
		take: 5,
		skip: 0,
	});
	const deleteMeetup = api.meetings.delete.useMutation({
		onSuccess: async () => {
			await utils.meetings.getAll.invalidate();
			await utils.friends.getAll.invalidate();
			await utils.reminders.stats.invalidate();
		},
	});

	const overdueFriends = overdueData?.friends ?? [];
	const recentMeetups = recentMeetupsResult?.items ?? [];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-4 font-semibold text-2xl">Overview</h2>
				<OverviewStats
					meetupsThisMonth={stats?.meetupsLast30Days ?? 0}
					totalFriends={stats?.totalFriends ?? 0}
					totalMeetups={stats?.totalMeetups ?? 0}
					upcomingReminders={overdueFriends.length}
				/>
			</div>

			{/* Overdue Reminders */}
			{overdueFriends.length > 0 && (
				<div>
					<h3 className="mb-3 font-medium text-destructive">
						Overdue Reminders
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{overdueFriends.map((friend) => (
							<FriendCard friend={friend} key={friend.id} />
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
