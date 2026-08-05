import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "../src/db";

try {
  await migrate(getDb(), { migrationsFolder: "drizzle" });
  console.log("PlantMind migrations applied.");
} finally {
  await closeDb();
}
