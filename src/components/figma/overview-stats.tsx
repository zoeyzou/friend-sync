"use client";

import { Calendar, Clock, TrendingUp, Users } from "lucide-react";

export function OverviewStats(props: {
	totalFriends: number;
	totalMeetups: number;
	meetupsThisMonth: number;
	upcomingReminders: number;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Users className="h-5 w-5 text-primary" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Total Friends</p>
						<p className="text-2xl">{props.totalFriends}</p>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
						<Calendar className="h-5 w-5 text-chart-2" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">All Meetups</p>
						<p className="text-2xl">{props.totalMeetups}</p>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
						<TrendingUp className="h-5 w-5 text-chart-3" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">This Month</p>
						<p className="text-2xl">{props.meetupsThisMonth}</p>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
						<Clock className="h-5 w-5 text-destructive" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Reminders</p>
						<p className="text-2xl">{props.upcomingReminders}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
