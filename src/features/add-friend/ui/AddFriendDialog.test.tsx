import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddFriendDialog } from "./AddFriendDialog";

vi.mock("~/trpc/react", () => ({
	api: {
		friends: {
			create: {
				useMutation: () => ({ mutate: vi.fn(), isPending: false }),
			},
		},
	},
}));

describe("AddFriendDialog", () => {
	it("shows validation error when name is empty", async () => {
		render(<AddFriendDialog isOpen onClose={vi.fn()} onCreated={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", { name: /add friend/i }));

		expect(
			await screen.findByText(/at least 2 characters/i),
		).toBeInTheDocument();
	});
});
