"use client";

// Re-export the shared dashboard actions context for backwards compatibility.
// New code should import from "~/shared/lib/dashboard-actions".
export {
  DashboardActionsProvider,
  useDashboardActions,
} from "~/shared/lib/dashboard-actions";
