import { z } from "zod";

const serverEnv = z.object({
  DATABASE_URL: z.string().url().default("postgres://plantmind:plantmind@localhost:5432/plantmind"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export const env = serverEnv.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  LOG_LEVEL: process.env.LOG_LEVEL
});
