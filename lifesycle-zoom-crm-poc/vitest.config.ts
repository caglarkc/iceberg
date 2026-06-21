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
      include: [
        "packages/crm-mock/src/**/*.ts",
        "packages/zoom-client/src/**/*.ts",
        "tools/zoom-service-mock/src/**/*.ts"
      ],
      exclude: ["**/*.test.ts", "**/index.ts"]
    }
  }
});
