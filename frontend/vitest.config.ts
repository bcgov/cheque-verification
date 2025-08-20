import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom", // Using happy-dom instead of jsdom for better React Aria support
    setupFiles: ["./__tests__/setup.ts"],
    globals: true,
    css: true,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "__tests__/",
        "src/vite-env.d.ts",
        "dist/",
        "coverage/",
        "vite.config.ts",
        "tailwind.config.ts",
        "eslint.config.js",
      ],
    },
  },
});
