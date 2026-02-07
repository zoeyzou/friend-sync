"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function FriendsPage() {
  const { data: session } = useSession();
  const { data: friends, isLoading } = api.friends.getAll.useQuery(
    { userId: session?.user?.id! },
    { enabled: !!session?.user?.id },
  );

  const [name, setName] = useState("");

  if (!session) return <div>Sign in</div>;

  return (
    <div className="container mx-auto p-8 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Friends</h1>
          <p className="text-muted-foreground">
            {friends?.length || 0} tracked
          </p>
        </div>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Add Friend</CardTitle>
          <CardDescription>Track new connections</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // addFriendMutation.mutate({ name });
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Friend's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {friends?.map((friend) => (
          <Card key={friend.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{friend.name}</CardTitle>
              <Badge>{friend.reminderDays}d</Badge>
            </CardHeader>
            <CardContent>
              {friend.email && (
                <p className="text-sm text-muted-foreground">{friend.email}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
