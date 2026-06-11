import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `@/` path alias so route handlers (which import via `@/lib/...`) are testable.
const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["lib/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}"],
    environment: "node",
  },
  resolve: {
    alias: { "@": dir },
  },
});
