import { addDays } from "date-fns";

type ReminderSource = {
  reminderDays: number;
  createdAt?: Date | string | null;
  lastContact?: Date | string | null;
};

function getBaseDate(friend: ReminderSource): Date {
  const base = friend.lastContact ?? friend.createdAt;
  if (!base) {
    throw new Error(
      "ReminderSource requires at least one of lastContact or createdAt",
    );
  }
  return new Date(base);
}

export function getNextReminderDate(friend: ReminderSource): Date {
  return addDays(getBaseDate(friend), friend.reminderDays);
}

export function isOverdue(friend: ReminderSource, now = new Date()): boolean {
  return getNextReminderDate(friend) < now;
}
