import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { middleware } from "../src/middleware";

async function testRedirect(path: string, shouldRedirect: boolean) {
	const url = new URL(path, "http://localhost");
	const request = new NextRequest(url);

	const response = await middleware(request);

	const redirected = response.redirected;
	const location = response.headers.get("location");

	if (shouldRedirect) {
		assert.equal(redirected, true, `${path} should redirect`);
		assert.equal(
			location,
			"http://localhost/auth/signin",
			`${path} should redirect to /auth/signin`,
		);
	} else {
		assert.equal(redirected, false, `${path} should not redirect`);
	}
}

async function run() {
	// Unauthenticated requests (no auth cookie) should be treated as no session.
	await testRedirect("/overview", true);
	await testRedirect("/friends", true);
	await testRedirect("/meetups", true);
	await testRedirect("/reminders", true);

	// Public routes remain accessible.
	await testRedirect("/auth/signin", false);
	await testRedirect("/", false);

	// eslint-disable-next-line no-console
	console.log("Protected routes middleware tests passed.");
}

run().catch((error) => {
	// eslint-disable-next-line no-console
	console.error(error);
	process.exit(1);
});

