import "@testing-library/jest-dom/vitest";
import React from "react";

// Ensure React is available globally for components compiled with the classic JSX runtime.
// This keeps tests working even if components omit an explicit React import.
(globalThis as unknown as { React: typeof React }).React = React;
