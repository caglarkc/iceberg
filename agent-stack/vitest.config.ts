import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@iceberg/parser": new URL("./packages/parser/src/index.ts", import.meta.url).pathname,
      "@iceberg/scaffolder": new URL("./packages/scaffolder/src/index.ts", import.meta.url).pathname,
      "@iceberg/handover-gen": new URL("./packages/handover-gen/src/index.ts", import.meta.url).pathname,
      "@iceberg/llm": new URL("./packages/llm/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "packages/parser/src/**/*.ts",
        "packages/scaffolder/src/**/*.ts",
        "packages/handover-gen/src/**/*.ts",
        "packages/llm/src/**/*.ts"
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  }
});
