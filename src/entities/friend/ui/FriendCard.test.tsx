import { fireEvent, render, screen } from "@testing-library/react";
import type { Friend } from "generated/prisma";
import { describe, expect, it, vi } from "vitest";
import { DashboardActionsProvider } from "~/shared/lib/dashboard-actions";
import { FriendCard } from "./FriendCard";

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
		render(
			<DashboardActionsProvider
				value={{ openAddFriend: vi.fn(), openLogMeetup: vi.fn() }}
			>
				<FriendCard friend={baseFriend} />
			</DashboardActionsProvider>,
		);

		expect(screen.getByText("Alice")).toBeInTheDocument();
	});

	it("calls openLogMeetup when clicked", () => {
		const openLogMeetup = vi.fn();

		render(
			<DashboardActionsProvider
				value={{ openAddFriend: vi.fn(), openLogMeetup }}
			>
				<FriendCard friend={baseFriend} />
			</DashboardActionsProvider>,
		);

		fireEvent.click(screen.getByRole("button"));
		expect(openLogMeetup).toHaveBeenCalledWith("friend-1");
	});
});
