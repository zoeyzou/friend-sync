"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  reminderDays: z.coerce.number().min(1).max(365),
});

export function AddFriendDialog(props: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      reminderDays: 30,
    },
  });

  useEffect(() => {
    if (!props.isOpen) form.reset();
  }, [props.isOpen, form]);

  const createFriend = api.friends.create.useMutation({
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
            <DialogTitle className="text-2xl">Add Friend</DialogTitle>
          </DialogHeader>

          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit((values) => {
              createFriend.mutate({
                name: values.name,
                reminderDays: values.reminderDays,
              });
            })}
          >
            <div className="space-y-2">
              <label className="block" htmlFor="add-friend-name">
                Friend&apos;s Name
              </label>
              <input
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                id="add-friend-name"
                placeholder="Enter name"
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
              <label className="block" htmlFor="add-friend-reminder">
                Reminder Frequency (days)
              </label>
              <input
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                id="add-friend-reminder"
                max={365}
                min={1}
                type="number"
                {...form.register("reminderDays")}
              />
              <p className="text-muted-foreground text-sm">
                You&apos;ll be reminded to meet every{" "}
                {form.watch("reminderDays")} days
              </p>
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
                  disabled={createFriend.isPending}
                  type="button"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createFriend.isPending}
                type="submit"
              >
                {createFriend.isPending ? "Adding..." : "Add Friend"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
