"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Friend } from "generated/prisma";
import { Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FriendCard } from "~/entities/friend";
import { api } from "~/trpc/react";

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  reminderDays: z.coerce.number().min(1).max(365),
});

function EditFriendDialog(props: {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", reminderDays: 30 },
  });

  useEffect(() => {
    if (!props.isOpen) return;
    if (!props.friend) return;
    form.reset({
      name: props.friend.name,
      reminderDays: props.friend.reminderDays,
    });
  }, [props.isOpen, props.friend, form]);

  const updateFriend = api.friends.update.useMutation({
    onSuccess: async () => {
      await utils.friends.getAll.invalidate();
      await utils.reminders.stats.invalidate();
      props.onClose();
    },
  });

  const deleteFriend = api.friends.delete.useMutation({
    onSuccess: async () => {
      await utils.friends.getAll.invalidate();
      await utils.reminders.stats.invalidate();
      await utils.meetings.getAll.invalidate();
      props.onClose();
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
            <DialogTitle className="text-2xl">Edit Friend</DialogTitle>
          </DialogHeader>

          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit((values) => {
              if (!props.friend) return;
              updateFriend.mutate({
                id: props.friend.id,
                name: values.name,
                reminderDays: values.reminderDays,
              });
            })}
          >
            <div className="space-y-2">
              <label className="block" htmlFor="edit-friend-name">
                Name
              </label>
              <input
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                id="edit-friend-name"
                type="text"
                {...form.register("name")}
              />
              {form.formState.errors.name?.message && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block" htmlFor="edit-friend-reminder">
                Reminder Frequency (days)
              </label>
              <input
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                id="edit-friend-reminder"
                max={365}
                min={1}
                type="number"
                {...form.register("reminderDays")}
              />
              {form.formState.errors.reminderDays?.message && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.reminderDays.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-3 pt-2">
              <DialogClose asChild>
                <button
                  className="flex-1 rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
                  disabled={updateFriend.isPending || deleteFriend.isPending}
                  type="button"
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  updateFriend.isPending ||
                  deleteFriend.isPending ||
                  !props.friend
                }
                onClick={() => {
                  if (!props.friend) return;
                  deleteFriend.mutate({ id: props.friend.id });
                }}
                type="button"
              >
                {deleteFriend.isPending ? "Deleting..." : "Delete"}
              </button>

              <button
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={updateFriend.isPending || deleteFriend.isPending}
                type="submit"
              >
                {updateFriend.isPending ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: friends = [], isLoading } = api.friends.getAll.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );

  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div>
      <h2 className="mb-4 font-semibold text-2xl">
        Friends ({friends.length})
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : friends.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {friends.map((f) => (
            <FriendCard
              friend={f}
              key={f.id}
              onEdit={(friend) => {
                setEditingFriend(friend);
                setIsEditOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No friends added yet. Use “Add Friend” in the header to get started.
          </p>
        </div>
      )}

      <EditFriendDialog
        friend={editingFriend}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingFriend(null);
        }}
      />
    </div>
  );
}
