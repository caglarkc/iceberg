import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      },
      include: ["apps/api/src/**/*.ts"],
      exclude: ["apps/api/src/index.ts", "apps/api/src/providers/real-zoom.adapter.ts"]
    }
  }
});
