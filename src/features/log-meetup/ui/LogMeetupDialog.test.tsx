import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LogMeetupDialog } from "./LogMeetupDialog";

vi.mock("~/trpc/react", () => ({
	api: {
		meetings: {
			create: {
				useMutation: () => ({ mutate: vi.fn(), isPending: false }),
			},
		},
	},
}));

describe("LogMeetupDialog", () => {
	it("shows validation error when friend is not selected", async () => {
		render(
			<LogMeetupDialog
				friends={[]}
				isOpen
				onClose={vi.fn()}
				onCreated={vi.fn()}
				selectedFriendId={null}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /save meetup/i }));

		expect(await screen.findByText(/friend is required/i)).toBeInTheDocument();
	});
});
