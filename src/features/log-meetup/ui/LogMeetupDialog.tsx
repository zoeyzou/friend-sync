"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Friend } from "generated/prisma";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogDescription,
	DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

const schema = z.object({
	friendId: z.string().min(1, "Friend is required"),
	date: z.string().min(1, "Date is required"),
	location: z.string().optional(),
	notes: z.string().optional(),
});

export function LogMeetupDialog(props: {
	isOpen: boolean;
	onClose: () => void;
	friends: Friend[];
	selectedFriendId: string | null;
	onCreated?: () => void | Promise<void>;
}) {
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			friendId: "",
			date: new Date().toISOString().slice(0, 10),
			location: "",
			notes: "",
		},
	});

	// Reset form when the dialog is closed to avoid leaking stale values
	// across different openings / selected friends.
	useEffect(() => {
		if (!props.isOpen) {
			form.reset({
				friendId: props.selectedFriendId ?? "",
				date: new Date().toISOString().slice(0, 10),
				location: "",
				notes: "",
			});
		}
	}, [props.isOpen, props.selectedFriendId, form]);

	const createMeeting = api.meetings.create.useMutation({
		onSuccess: async () => {
			props.onClose();
			await props.onCreated?.();
		},
	});

	return (
		<Dialog
			onOpenChange={(open) => !open && props.onClose()}
			open={props.isOpen}
		>
			<DialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-md">
				<div className="p-6">
					<DialogHeader className="text-left">
						<DialogTitle className="text-2xl">Log Meetup</DialogTitle>
						<DialogDescription>
							Record a recent meetup so FriendTrack can keep your reminders up
							to date.
						</DialogDescription>
					</DialogHeader>

					<form
						className="mt-6 space-y-4"
						onSubmit={form.handleSubmit((values) => {
							const exists = props.friends.some(
								(friend) => friend.id === values.friendId,
							);

							if (!exists) {
								form.setError("friendId", {
									type: "validate",
									message:
										"Selected friend is no longer available. Please pick another friend.",
								});
								return;
							}

							const date = new Date(values.date);
							createMeeting.mutate({
								friendId: values.friendId,
								date,
								title: "Meetup",
								location: values.location?.trim() ? values.location : undefined,
								notes: values.notes?.trim() ? values.notes : undefined,
							});
						})}
					>
						<div className="space-y-2">
							<label className="block" htmlFor="log-meetup-friend">
								Friend
							</label>
							<select
								className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
								id="log-meetup-friend"
								{...form.register("friendId")}
							>
								<option disabled value="">
									Select a friend
								</option>
								{props.friends.map((f) => (
									<option key={f.id} value={f.id}>
										{f.name}
									</option>
								))}
							</select>
							{form.formState.errors.friendId?.message && (
								<p className="text-destructive text-sm">
									{form.formState.errors.friendId.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="block" htmlFor="log-meetup-date">
								Date
							</label>
							<input
								className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
								id="log-meetup-date"
								type="date"
								{...form.register("date")}
							/>
							{form.formState.errors.date?.message && (
								<p className="text-destructive text-sm">
									{form.formState.errors.date.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="block" htmlFor="log-meetup-location">
								Location (optional)
							</label>
							<input
								className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
								id="log-meetup-location"
								placeholder="e.g., Coffee shop, Park"
								type="text"
								{...form.register("location")}
							/>
						</div>

						<div className="space-y-2">
							<label className="block" htmlFor="log-meetup-notes">
								Notes (optional)
							</label>
							<textarea
								className="min-h-24 w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
								id="log-meetup-notes"
								placeholder="What did you do? How was it?"
								{...form.register("notes")}
							/>
						</div>

						<DialogFooter className="gap-3 pt-2">
							<DialogClose asChild>
								<button
									className="flex-1 rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
									disabled={createMeeting.isPending}
									type="button"
								>
									Cancel
								</button>
							</DialogClose>
							<button
								className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={createMeeting.isPending}
								type="submit"
							>
								{createMeeting.isPending ? "Saving..." : "Save Meetup"}
							</button>
							{createMeeting.error?.message && (
								<p className="text-destructive text-sm">
									{createMeeting.error.message}
								</p>
							)}
						</DialogFooter>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
