import { closeDb, getDb } from "../src/db";
import {
  assets,
  assetTypes,
  auditEvents,
  operationalMetrics,
  productionAreas,
  roles,
  scenarios,
  scenarioStages,
  scenarioStates,
  sensorReadings,
  sensors,
  sites,
  sourceRecords,
  tenants,
  users
} from "../src/db/schema";
import {
  sampleAt,
  SCENARIO_DURATION_MINUTES,
  SCENARIO_ID,
  SCENARIO_STAGES,
  SCENARIO_START
} from "../src/lib/scenario";

const ids = {
  tenant: "10000000-0000-4000-8000-000000000001",
  site: "10000000-0000-4000-8000-000000000002",
  area: "10000000-0000-4000-8000-000000000003",
  assetType: "10000000-0000-4000-8000-000000000004",
  asset: "10000000-0000-4000-8000-000000000005",
  scenario: "10000000-0000-4000-8000-000000000006",
  role: "10000000-0000-4000-8000-000000000007",
  user: "10000000-0000-4000-8000-000000000008"
};
const sensorDefs = [
  ["P204A-VIB-DE", "vibration", "mm/s RMS"],
  ["P204A-TEMP-BRG", "temperature", "°C"],
  ["P204A-P-SUCT", "suction_pressure", "bar"],
  ["P204A-P-DISC", "discharge_pressure", "bar"],
  ["P204A-FLOW", "flow", "m³/h"],
  ["P204A-I-MOTOR", "motor_current", "A"],
  ["P204A-POWER", "power", "kW"]
] as const;
const sensorIds = sensorDefs.map(
  (_, index) => `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
);
const db = getDb();
try {
  await db.transaction(async (tx) => {
    await tx
      .insert(tenants)
      .values({ id: ids.tenant, name: "Aranya Process Industries", slug: "aranya-process" })
      .onConflictDoNothing();
    await tx
      .insert(sites)
      .values({
        id: ids.site,
        tenantId: ids.tenant,
        name: "Dahej Plant",
        code: "DHP",
        timezone: "Asia/Kolkata"
      })
      .onConflictDoNothing();
    await tx
      .insert(productionAreas)
      .values({
        id: ids.area,
        tenantId: ids.tenant,
        siteId: ids.site,
        name: "Reactor Line 2",
        code: "RL-2"
      })
      .onConflictDoNothing();
    await tx
      .insert(assetTypes)
      .values({
        id: ids.assetType,
        name: "Centrifugal Pump",
        manufacturer: "Simulated Industrial Works",
        model: "CP-80/4"
      })
      .onConflictDoNothing();
    await tx
      .insert(assets)
      .values({
        id: ids.asset,
        tenantId: ids.tenant,
        siteId: ids.site,
        productionAreaId: ids.area,
        assetTypeId: ids.assetType,
        tag: "P-204A",
        name: "Cooling Water Pump P-204A",
        serialNumber: "SIM-P204A",
        metadata: {
          duty: "cooling-water circulation",
          criticality: "production-support",
          source: "deterministic synthetic fixture"
        }
      })
      .onConflictDoNothing();
    await tx
      .insert(scenarios)
      .values({
        id: ids.scenario,
        tenantId: ids.tenant,
        siteId: ids.site,
        slug: SCENARIO_ID,
        name: "P-204A controlled degradation replay",
        description: "Eight-hour deterministic synthetic pump replay for demonstration only.",
        startsAt: new Date(SCENARIO_START),
        durationMinutes: SCENARIO_DURATION_MINUTES,
        fixtureVersion: "sprint1-v1",
        simulated: true
      })
      .onConflictDoNothing();
    await tx
      .insert(roles)
      .values({
        id: ids.role,
        tenantId: ids.tenant,
        key: "executive_viewer",
        name: "Executive Viewer",
        permissions: [
          "site:read",
          "scenario:control",
          "asset:read",
          "investigation:read",
          "brief:read"
        ]
      })
      .onConflictDoNothing();
    await tx
      .insert(users)
      .values({
        id: ids.user,
        tenantId: ids.tenant,
        roleId: ids.role,
        email: "anika.kapur@example.invalid",
        displayName: "Anika Kapur"
      })
      .onConflictDoNothing();
    await tx
      .insert(sensors)
      .values(
        sensorDefs.map(([tag, measurement, unit], index) => ({
          id: sensorIds[index],
          tenantId: ids.tenant,
          siteId: ids.site,
          assetId: ids.asset,
          tag,
          measurement,
          unit,
          simulated: true
        }))
      )
      .onConflictDoNothing();
    await tx
      .insert(scenarioStages)
      .values(
        SCENARIO_STAGES.map((stage, index) => ({
          id: `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
          scenarioId: ids.scenario,
          key: stage.id,
          label: stage.label,
          ordinal: index,
          startMinute: stage.startMinute,
          description: stage.description
        }))
      )
      .onConflictDoNothing();
    await tx
      .insert(scenarioStates)
      .values({
        id: "40000000-0000-4000-8000-000000000001",
        scenarioId: ids.scenario,
        status: "idle",
        elapsedMinutes: 0,
        speed: 12,
        currentStageKey: "normal",
        lastActor: "seed"
      })
      .onConflictDoNothing();
    const readings: Array<typeof sensorReadings.$inferInsert> = [];
    const metrics: Array<typeof operationalMetrics.$inferInsert> = [];
    for (let minute = 0; minute <= SCENARIO_DURATION_MINUTES; minute += 5) {
      const sample = sampleAt(minute);
      const time = new Date(new Date(SCENARIO_START).getTime() + minute * 60_000);
      const values = [
        sample.vibration,
        sample.temperature,
        +(1.72 - (5.2 - sample.pressure) * 0.1).toFixed(2),
        sample.pressure,
        sample.flow,
        +(sample.power * 1.45).toFixed(1),
        sample.power
      ];
      values.forEach((value, index) =>
        readings.push({
          tenantId: ids.tenant,
          siteId: ids.site,
          sensorId: sensorIds[index]!,
          scenarioId: ids.scenario,
          recordedAt: time,
          value,
          quality: "good",
          simulated: true
        })
      );
      metrics.push({
        tenantId: ids.tenant,
        siteId: ids.site,
        productionAreaId: ids.area,
        scenarioId: ids.scenario,
        recordedAt: time,
        name: "throughput_vs_plan",
        value: sample.throughput,
        unit: "%",
        context: { batch: "24-071", mode: "controlled-run" },
        simulated: true
      });
    }
    await tx.insert(sensorReadings).values(readings).onConflictDoNothing();
    await tx.insert(operationalMetrics).values(metrics).onConflictDoNothing();
    await tx
      .insert(sourceRecords)
      .values([
        {
          id: "50000000-0000-4000-8000-000000000001",
          tenantId: ids.tenant,
          siteId: ids.site,
          assetId: ids.asset,
          recordType: "maintenance_history",
          occurredAt: new Date("2025-11-08T04:30:00.000Z"),
          title: "Planned bearing inspection",
          detail: "Synthetic record: bearing clearance checked; no defect asserted.",
          simulated: true
        },
        {
          id: "50000000-0000-4000-8000-000000000002",
          tenantId: ids.tenant,
          siteId: ids.site,
          assetId: ids.asset,
          recordType: "maintenance_history",
          occurredAt: new Date("2026-02-11T05:15:00.000Z"),
          title: "Seal and coupling visual check",
          detail: "Synthetic record: observation captured for replay context only.",
          simulated: true
        }
      ])
      .onConflictDoNothing();
    await tx
      .insert(auditEvents)
      .values({
        id: "60000000-0000-4000-8000-000000000001",
        tenantId: ids.tenant,
        siteId: ids.site,
        scenarioId: ids.scenario,
        actorType: "system",
        actorId: "seed",
        eventType: "fixture.seeded",
        entityType: "scenario",
        entityId: ids.scenario,
        detail: { fixtureVersion: "sprint1-v1", deterministic: true, simulated: true }
      })
      .onConflictDoNothing();
  });
  console.log(
    `Seeded ${sensorDefs.length} sensors, 679 readings, 97 operational metrics, 6 stages and 2 maintenance records.`
  );
} finally {
  await closeDb();
}
