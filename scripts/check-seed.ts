import { count, eq } from "drizzle-orm";
import { closeDb, getDb } from "../src/db";
import {
  operationalMetrics,
  scenarios,
  scenarioStages,
  sensorReadings,
  sensors,
  sourceRecords
} from "../src/db/schema";
import { SCENARIO_ID } from "../src/lib/scenario";

const db = getDb();
try {
  const [scenario] = await db
    .select({ id: scenarios.id })
    .from(scenarios)
    .where(eq(scenarios.slug, SCENARIO_ID));
  if (!scenario) throw new Error("Deterministic scenario is missing");
  const [[sensorCount], [readingCount], [metricCount], [stageCount], [sourceCount]] =
    await Promise.all([
      db.select({ value: count() }).from(sensors),
      db
        .select({ value: count() })
        .from(sensorReadings)
        .where(eq(sensorReadings.scenarioId, scenario.id)),
      db
        .select({ value: count() })
        .from(operationalMetrics)
        .where(eq(operationalMetrics.scenarioId, scenario.id)),
      db
        .select({ value: count() })
        .from(scenarioStages)
        .where(eq(scenarioStages.scenarioId, scenario.id)),
      db.select({ value: count() }).from(sourceRecords)
    ]);
  const actual = {
    sensors: sensorCount!.value,
    readings: readingCount!.value,
    metrics: metricCount!.value,
    stages: stageCount!.value,
    sourceRecords: sourceCount!.value
  };
  const expected = { sensors: 7, readings: 679, metrics: 97, stages: 6, sourceRecords: 2 };
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`Fixture mismatch: ${JSON.stringify(actual)}`);
  console.log("Deterministic fixture verified", actual);
} finally {
  await closeDb();
}
