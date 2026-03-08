"use client";

import { useState } from "react";

import { MeetupCard } from "~/entities/meeting";
import { api } from "~/trpc/react";

export default function MeetupsPage() {
	const [page, setPage] = useState(0);
	const pageSize = 50;

	const utils = api.useUtils();
	const {
		data: meetups = [],
		isLoading,
		isFetching,
	} = api.meetings.getAll.useQuery({
		take: pageSize,
		skip: page * pageSize,
	});

	const deleteMeetup = api.meetings.delete.useMutation({
		onSuccess: async () => {
			await utils.meetings.getAll.invalidate();
			await utils.friends.getAll.invalidate();
			await utils.reminders.stats.invalidate();
		},
	});

	const hasNextPage = meetups.length === pageSize;

	return (
		<div>
			<h2 className="mb-4 font-semibold text-2xl">
				All Meetups ({meetups.length})
			</h2>

			{isLoading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : (
				<>
					{meetups.length > 0 ? (
						<>
							<div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
								<span>
									Page {page + 1}
									{hasNextPage ? " (50 per page)" : ""}
								</span>
							</div>
							<div className="space-y-3">
								{meetups.map((m) => (
									<MeetupCard
										key={m.id}
										meetup={m}
										onDelete={(id) => deleteMeetup.mutate({ id })}
									/>
								))}
							</div>
							<div className="mt-6 flex items-center justify-between gap-3">
								<button
									className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground disabled:opacity-50"
									disabled={page === 0 || isFetching}
									type="button"
									onClick={() =>
										setPage((prev) => (prev > 0 ? prev - 1 : 0))
									}
								>
									Previous
								</button>
								<button
									className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground disabled:opacity-50"
									disabled={!hasNextPage || isFetching}
									type="button"
									onClick={() =>
										setPage((prev) => prev + 1)
									}
								>
									Next
								</button>
							</div>
						</>
					) : (
						<div className="py-12 text-center text-muted-foreground">
							No meetups logged yet. Start tracking your social life!
						</div>
					)}
				</>
			)}
		</div>
	);
}
