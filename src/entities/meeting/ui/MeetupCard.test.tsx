import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeetupCard } from "./MeetupCard";

describe("MeetupCard", () => {
	it("renders friend name, date, and optional fields", () => {
		const onDelete = vi.fn();
		const meetup = {
			id: "meetup-1",
			date: new Date("2024-01-15T00:00:00Z"),
			location: "Cafe",
			notes: "Great chat",
			friend: { id: "friend-1", name: "Alice" },
		};

		render(<MeetupCard meetup={meetup} onDelete={onDelete} />);

		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Cafe")).toBeInTheDocument();
		expect(screen.getByText("Great chat")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Delete"));
		expect(onDelete).toHaveBeenCalledWith("meetup-1");
	});
});
