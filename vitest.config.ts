import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import path from "node:path";

export default defineConfig({
  plugins: [solid()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") }, conditions: ["browser"] },
  test: { environment: "jsdom", testTimeout: 20000, include: ["tests/**/*.test.tsx"], restoreMocks: true },
});
