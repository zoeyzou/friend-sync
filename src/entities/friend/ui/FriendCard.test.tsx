import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Friend } from "generated/prisma";
import { describe, expect, it, vi } from "vitest";
import { FriendCard } from "./FriendCard";

const openLogMeetup = vi.fn();

vi.mock("~/shared/lib/dashboard-actions", () => ({
  useDashboardActions: () => ({
    openAddFriend: vi.fn(),
    openLogMeetup,
  }),
  DashboardActionsProvider: (props: { children: React.ReactNode }) => (
    <>{props.children}</>
  ),
}));

const baseFriend = {
  id: "friend-1",
  name: "Alice",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  lastContact: new Date("2024-01-10T00:00:00Z"),
  reminderDays: 7,
  // fields not used by the card can be stubbed
  meetings: [],
  userId: "user-1",
} as unknown as Friend;

describe("FriendCard", () => {
  it("shows friend name and relative last contact", () => {
    render(<FriendCard friend={baseFriend} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("calls openLogMeetup when clicked", async () => {
    render(<FriendCard friend={baseFriend} />);

    const buttons = screen.getAllByRole("button");
    const cardButton = buttons[0];
    if (!cardButton) {
      throw new Error("Expected FriendCard to render at least one button");
    }

    await userEvent.click(cardButton);
    expect(openLogMeetup).toHaveBeenCalledWith("friend-1");
  });
});
