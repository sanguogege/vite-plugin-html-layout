// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		dts({
			outDir: "dist",
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "layout",
			formats: ["es", "cjs", "umd", "iife"],
			fileName: "index",
		},
		rollupOptions: {
			external: ["fs", "fs/promises", "path"],
		},
	},
});
