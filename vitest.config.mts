import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
	},
	resolve: {
		alias: {
			"~": resolve(rootDir, "src"),
		},
	},
});
