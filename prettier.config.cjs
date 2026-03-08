// prettier.config.cjs
/** Keep Biome as the primary formatter; this just aligns Prettier with it. */
module.exports = {
	// General
	printWidth: 80,
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: false,
	trailingComma: "es5",
	bracketSpacing: true,
	arrowParens: "always",

	// Files
	overrides: [
		{
			files: ["*.json", "*.jsonc", "*.md", "*.yaml", "*.yml"],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
};
