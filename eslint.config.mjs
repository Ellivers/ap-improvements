import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.js"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: {
			sourceType: "script",
			ecmaVersion: "latest",
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					globalReturn: true,
					impliedStrict: true,
				},
			},
		},
	},
]);
