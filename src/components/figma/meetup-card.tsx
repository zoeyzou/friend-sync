"use client";

import { format } from "date-fns";
import { Calendar, MapPin, MessageSquare } from "lucide-react";

export function MeetupCard(props: {
	meetup: {
		id: string;
		date: Date | string;
		location: string | null;
		notes: string | null;
		friend: { id: string; name: string };
	};
	onDelete?: (id: string) => void;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<h4 className="font-medium">{props.meetup.friend.name}</h4>
					<div className="mt-2 flex items-center gap-2 text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span className="text-sm">
							{format(new Date(props.meetup.date), "EEEE, MMMM d, yyyy")}
						</span>
					</div>
					{props.meetup.location && (
						<div className="mt-1 flex items-center gap-2 text-muted-foreground">
							<MapPin className="h-4 w-4" />
							<span className="text-sm">{props.meetup.location}</span>
						</div>
					)}
					{props.meetup.notes && (
						<div className="mt-2 flex items-start gap-2 text-muted-foreground">
							<MessageSquare className="mt-0.5 h-4 w-4" />
							<span className="text-sm">{props.meetup.notes}</span>
						</div>
					)}
				</div>

				{props.onDelete && (
					<button
						className="px-2 py-1 text-destructive hover:text-destructive/80"
						onClick={() => props.onDelete?.(props.meetup.id)}
						type="button"
					>
						Delete
					</button>
				)}
			</div>
		</div>
	);
}
