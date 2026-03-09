"use client";

import { format, formatDistanceToNow } from "date-fns";
import type { Friend } from "generated/prisma";
import { Calendar, Clock, User } from "lucide-react";
import { getNextReminderDate, isOverdue } from "~/lib/reminder-utils";
import { useDashboardActions } from "~/shared/lib/dashboard-actions";

export function FriendCard(props: {
  friend: Friend;
  onEdit?: (friend: Friend) => void;
}) {
  const { openLogMeetup } = useDashboardActions();

  const now = new Date();
  const nextReminder = getNextReminderDate(props.friend);
  const overdue = isOverdue(props.friend, now);

  return (
    <div className="relative rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent">
      <button
        className="w-full rounded-md text-left focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => openLogMeetup(props.friend.id)}
        type="button"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{props.friend.name}</h3>
              {props.friend.lastContact && (
                <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(props.friend.lastContact), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`mt-3 flex items-center gap-2 border-border border-t pt-3 ${
            overdue ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {overdue ? "Overdue: " : "Meet by: "}
            {format(nextReminder, "MMM d, yyyy")}
          </span>
        </div>
      </button>

      {props.onEdit && (
        <button
          className="absolute top-4 right-4 px-2 py-1 text-muted-foreground hover:text-foreground"
          onClick={() => props.onEdit?.(props.friend)}
          type="button"
        >
          Edit
        </button>
      )}
    </div>
  );
}
