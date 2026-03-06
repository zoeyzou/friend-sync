"use client";

import { MeetupCard } from "~/components/figma/meetup-card";
import { api } from "~/trpc/react";

export default function MeetupsPage() {
	const utils = api.useUtils();
	const { data: meetups = [], isLoading } = api.meetings.getAll.useQuery({
		take: 200,
	});

	const deleteMeetup = api.meetings.delete.useMutation({
		onSuccess: async () => {
			await utils.meetings.getAll.invalidate();
			await utils.friends.getAll.invalidate();
			await utils.reminders.stats.invalidate();
		},
	});

	return (
		<div>
			<h2 className="mb-4 font-semibold text-2xl">
				All Meetups ({meetups.length})
			</h2>

			{isLoading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : meetups.length > 0 ? (
				<div className="space-y-3">
					{meetups.map((m) => (
						<MeetupCard
							key={m.id}
							meetup={m}
							onDelete={(id) => deleteMeetup.mutate({ id })}
						/>
					))}
				</div>
			) : (
				<div className="py-12 text-center text-muted-foreground">
					No meetups logged yet. Start tracking your social life!
				</div>
			)}
		</div>
	);
}
