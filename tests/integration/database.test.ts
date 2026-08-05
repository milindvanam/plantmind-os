// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
const enabled = process.env.RUN_DB_TESTS === "1";
const sql = enabled
  ? postgres(
      process.env.DATABASE_URL ?? "postgres://plantmind:plantmind@localhost:5432/plantmind",
      { max: 1 }
    )
  : null;
afterAll(async () => {
  await sql?.end();
});
describe.skipIf(!enabled)("seeded PostgreSQL fixture", () => {
  it("contains the exact deterministic Sprint 1 record counts", async () => {
    const [row] =
      await sql!`select (select count(*)::int from sensors) sensors, (select count(*)::int from sensor_readings) readings, (select count(*)::int from operational_metrics) metrics, (select count(*)::int from scenario_stages) stages, (select count(*)::int from source_records) sources`;
    expect(row).toMatchObject({ sensors: 7, readings: 679, metrics: 97, stages: 6, sources: 2 });
  });
});
