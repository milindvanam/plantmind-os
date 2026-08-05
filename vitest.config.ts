import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
      "tests/integration/**/*.test.ts"
    ],
    coverage: { reporter: ["text", "html"] }
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }
});
