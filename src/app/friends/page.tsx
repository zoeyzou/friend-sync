"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2, Plus, Edit3, Trash2, Calendar } from "lucide-react";
import type { Friend } from "generated/prisma";
import { DatePicker } from "./_components";
import { format } from "date-fns";

// === FORM SCHEMAS ===
const addFriendSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  reminderDays: z.coerce.number().min(1).max(365),
});

const editFriendSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

const logMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.coerce.date(),
  duration: z.coerce.number().min(5, "Duration at least 5 mins"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export default function FriendsPage() {
  const { data: session, status } = useSession();

  const {
    data: friends,
    refetch,
    isLoading: friendsLoading,
  } = api.friends.getAll.useQuery(
    {
      userId: session?.user?.id!,
    },
    { enabled: !!session?.user?.id },
  );

  // === ADD FRIEND FORM ===
  const addForm = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: { name: "", email: "", reminderDays: 30 },
  });

  const addMutation = api.friends.create.useMutation({
    onSuccess: () => {
      addForm.reset();
      refetch();
    },
  });

  // === EDIT FRIEND FORM ===
  const editForm = useForm<z.infer<typeof editFriendSchema>>({
    resolver: zodResolver(editFriendSchema),
    defaultValues: { name: "", email: "" },
  });

  const editMutation = api.friends.update.useMutation({
    onSuccess: () => {
      editForm.reset();
      refetch();
    },
  });

  const deleteMutation = api.friends.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleEdit = async (friend: Friend) => {
    editForm.reset({
      name: friend.name,
      email: friend.email || "",
    });
  };

  const logMeetingForm = useForm<z.infer<typeof logMeetingSchema>>({
    resolver: zodResolver(logMeetingSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      duration: 0,
      location: "",
      notes: "",
    },
  });

  const logMutation = api.meetings.create.useMutation({
    onSuccess: () => {
      logMeetingForm.reset();
      refetch();
    },
  });

  if (status === "loading") {
    return <Loader2 className="h-12 w-12 animate-spin mx-auto mt-48" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Sign in required</h1>
          <a
            href="/api/auth/signin"
            className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-2xl font-bold text-white shadow-lg"
          >
            Sign In →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-8 max-w-4xl space-y-8 min-h-screen pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-green-400 to-primary bg-clip-text text-transparent">
              Friends
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              {friendsLoading
                ? "Loading..."
                : `${friends?.length || 0} tracked`}
            </p>
          </div>

          {/* Add Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="shadow-xl hover:shadow-2xl h-14 px-8 text-lg"
              >
                <Plus className="h-6 w-6 mr-3" />
                Add Friend
              </Button>
            </DialogTrigger>

            {/* ADD FORM w/ React Hook Form */}
            <DialogContent className="sm:max-w-lg bg-amber-50">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Friend</DialogTitle>
                <DialogDescription>
                  Track meetings and get automatic reminders to stay connected.
                </DialogDescription>
              </DialogHeader>

              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit((values) => {
                    addMutation.mutate({
                      name: values.name,
                      email: values.email || undefined,
                      reminderDays: values.reminderDays,
                    });
                  })}
                  className="space-y-6"
                >
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="reminderDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Days</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="gap-3 pt-4">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                      disabled={
                        addForm.formState.isSubmitting || addMutation.isPending
                      }
                    >
                      {addMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Friend"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Friends List */}
        <div className="grid gap-6">
          {friends?.map((friend) => (
            <Card
              key={friend.id}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-primary group-hover:text-green-400 transition-colors">
                      {friend.name}
                    </CardTitle>
                    {friend.email && (
                      <p className="text-muted-foreground mt-2 text-lg">
                        {friend.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="secondary" className="text-sm">
                      {friend._count?.meetings || 0} meetings
                    </Badge>
                    <Badge
                      variant={friend.lastContact ? "default" : "destructive"}
                      className="text-sm px-4 py-2 shadow-md"
                    >
                      {friend.lastContact
                        ? `Last: ${format(new Date(friend.lastContact), "MMM dd")}`
                        : `${friend.reminderDays}d reminder`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                {friend.meetings.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {friend.meetings.map((meeting) => (
                      <li
                        key={meeting.id}
                        className="text-sm text-slate-400 flex justify-between px-2 py-1 rounded-md bg-slate-100/50"
                      >
                        <span>{meeting.title}</span>
                        <span>{format(meeting.date, "MMM dd")}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-3 opacity-70 group-hover:opacity-100 transition-all duration-300 flex-wrap">
                  {/* EDIT */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-12 px-6"
                        onClick={() => handleEdit(friend)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>

                    {/* EDIT FORM w/ React Hook Form */}
                    <DialogContent className="bg-amber-50 sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit {friend.name}</DialogTitle>
                      </DialogHeader>

                      <Form {...editForm}>
                        <form
                          onSubmit={editForm.handleSubmit((values) => {
                            editMutation.mutate({
                              id: friend.id,
                              ...values,
                            });
                          })}
                          className="space-y-6"
                        >
                          <FormField
                            control={editForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={editForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter className="gap-3">
                            <DialogClose asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={
                                editForm.formState.isSubmitting ||
                                editMutation.isPending
                              }
                            >
                              {editMutation.isPending ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {/* DELETE */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 h-12 px-6"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-destructive">
                          <Trash2 className="h-6 w-6" />
                          Delete {friend.name}?
                        </DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete:
                          <div className="mt-4 space-y-1 text-sm">
                            <div>• {friend.name}</div>
                            <div>• {friend._count?.meetings || 0} meetings</div>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteMutation.mutate({ id: friend.id })
                          }
                        >
                          Delete Forever
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Log meeting */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-12 px-6">
                        <Calendar className="h-4 w-4 mr-2" />
                        Log Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Log meeting with friend {friend.name}
                        </DialogTitle>
                        <DialogDescription>
                          Log a meeting with {friend.name} to stay connected.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...logMeetingForm}>
                        <form
                          onSubmit={logMeetingForm.handleSubmit((values) => {
                            console.log(values);
                            logMutation.mutate({
                              friendId: friend.id,
                              ...values,
                            });
                          })}
                          className="space-y-6"
                        >
                          <FormField
                            control={logMeetingForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="input-required">
                                  Title
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} className="h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={logMeetingForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <DatePicker
                                    selectedDate={field.value}
                                    selectDate={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={logMeetingForm.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    className="h-12"
                                    placeholder="Duration in minutes"
                                    min={0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={logMeetingForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input {...field} className="h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={logMeetingForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              disabled={logMutation.isPending}
                            >
                              {logMutation.isPending ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Logging...
                                </>
                              ) : (
                                "Log Meeting"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* EMPTY STATE */}
        {friends?.length === 0 && !friendsLoading && (
          <div className="text-center py-32 space-y-8">
            <div className="text-8xl opacity-20 mb-8">👥</div>
            <h2 className="text-4xl font-bold text-muted-foreground mb-4">
              No friends tracked yet
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">
              Add your first friend to automatically track meetings and get
              smart reminders when it's time to reconnect.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-2xl h-16 px-12 text-xl">
                  <Plus className="h-8 w-8 mr-4" />
                  Add your first friend
                </Button>
              </DialogTrigger>
              {/* Add dialog same as header */}
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}
