import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "./middleware";

vi.mock("next-auth/jwt", () => ({
	getToken: vi.fn(),
}));

import { getToken } from "next-auth/jwt";

const mockedGetToken = getToken as unknown as ReturnType<typeof vi.fn>;

async function runThroughMiddleware(path: string) {
	const url = new URL(path, "http://localhost");
	const request = new NextRequest(url);
	return middleware(request);
}

describe("middleware protected routes", () => {
	beforeEach(() => {
		mockedGetToken.mockReset();
	});

	it("redirects unauthenticated users from protected routes", async () => {
		mockedGetToken.mockResolvedValue(null as any);

		for (const path of ["/overview", "/friends", "/meetups", "/reminders"]) {
			const response = await runThroughMiddleware(path);
			expect(response.headers.get("location")).toBe(
				"http://localhost/auth/signin",
			);
		}
	});

	it("allows unauthenticated access to public routes", async () => {
		mockedGetToken.mockResolvedValue(null as any);

		for (const path of ["/auth/signin", "/"]) {
			const response = await runThroughMiddleware(path);
			expect(response.headers.get("location")).toBeNull();
		}
	});

	it("allows authenticated access to protected routes", async () => {
		mockedGetToken.mockResolvedValue({ sub: "user-1" } as any);

		for (const path of ["/overview", "/friends", "/meetups", "/reminders"]) {
			const response = await runThroughMiddleware(path);
			expect(response.redirected).toBe(false);
		}
	});
});

