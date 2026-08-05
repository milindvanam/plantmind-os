import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
export function getDb() {
  client ??= postgres(env.DATABASE_URL, { max: 5, idle_timeout: 20 });
  return drizzle(client, { schema });
}
export async function closeDb() {
  if (client) {
    await client.end();
    client = undefined;
  }
}
