import { describe, expect, it } from "vitest";

import { getNextReminderDate, isOverdue } from "./reminder-utils";

describe("reminder-utils", () => {
	it("uses lastContact when present", () => {
		const base = new Date("2024-01-01T00:00:00Z");
		const friend = {
			reminderDays: 10,
			createdAt: new Date("2023-12-01T00:00:00Z"),
			lastContact: base,
		};

		const next = getNextReminderDate(friend);
		expect(next.toISOString()).toBe(
			new Date("2024-01-11T00:00:00Z").toISOString(),
		);
	});

	it("falls back to createdAt when lastContact is missing", () => {
		const base = new Date("2024-02-01T00:00:00Z");
		const friend = {
			reminderDays: 5,
			createdAt: base,
			lastContact: null,
		};

		const next = getNextReminderDate(friend);
		expect(next.toISOString()).toBe(
			new Date("2024-02-06T00:00:00Z").toISOString(),
		);
	});

	it("throws when neither lastContact nor createdAt is present", () => {
		const friend: {
			reminderDays: number;
			createdAt?: Date | string | null;
			lastContact?: Date | string | null;
		} = {
			reminderDays: 7,
		};

		expect(() => getNextReminderDate(friend)).toThrowError(
			/lastContact or createdAt/,
		);
	});

	it("detects overdue correctly", () => {
		const base = new Date("2024-03-01T00:00:00Z");
		const friend = {
			reminderDays: 3,
			createdAt: base,
		};

		const now = new Date("2024-03-10T00:00:00Z");
		expect(isOverdue(friend, now)).toBe(true);
	});
});
