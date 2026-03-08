import { addDays } from "date-fns";

type ReminderSource = {
	reminderDays: number;
	createdAt: Date | string;
	lastContact?: Date | string | null;
};

export function getNextReminderDate(friend: ReminderSource): Date {
	const base = friend.lastContact ?? friend.createdAt;
	return addDays(new Date(base), friend.reminderDays);
}

export function isOverdue(friend: ReminderSource, now = new Date()): boolean {
	return getNextReminderDate(friend) < now;
}

