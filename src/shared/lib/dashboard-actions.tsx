"use client";

import { createContext, useContext, type ReactNode } from "react";

type DashboardActions = {
	openAddFriend: () => void;
	openLogMeetup: (friendId?: string) => void;
};

const DashboardActionsContext = createContext<DashboardActions | null>(null);

export function DashboardActionsProvider(props: {
	value: DashboardActions;
	children: ReactNode;
}) {
	return (
		<DashboardActionsContext.Provider value={props.value}>
			{props.children}
		</DashboardActionsContext.Provider>
	);
}

export function useDashboardActions() {
	const ctx = useContext(DashboardActionsContext);
	if (!ctx) {
		throw new Error(
			"useDashboardActions must be used within DashboardActionsProvider",
		);
	}
	return ctx;
}
