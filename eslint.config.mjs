import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["src/features/pm01/plantmind/**/*.{ts,tsx}", "src/features/pm01/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/pm01/plant-reality", "@/features/pm01/plant-reality/**"],
              message: "PlantMind and UI code may consume PM-01 observable contracts only."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/features/pm01/observable/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/state/ground-truth", "**/state/ground-truth.*"],
              message: "Observable projections may never import PM-01 hidden ground truth."
            }
          ]
        }
      ]
    }
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "drizzle/meta/**"
  ])
]);
