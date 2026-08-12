import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type {
  DatasetManifest,
  HydraulicCycle,
  SensorStatistic
} from "../src/features/real-data/canonical-telemetry";

const root = process.cwd();
const rawDirectory = path.join(root, "data", "real", "hydraulic-system", "raw");
const outputDirectory = path.join(root, "data", "real", "hydraulic-system", "normalized");
const outputFile = path.join(outputDirectory, "cycles.json");
const sensors = [
  ["PS1", "pressure inlet", "bar", 100],
  ["PS2", "pressure outlet", "bar", 100],
  ["PS3", "pressure circuit", "bar", 100],
  ["PS4", "pressure return", "bar", 100],
  ["PS5", "pressure cooling", "bar", 100],
  ["PS6", "pressure filtration", "bar", 100],
  ["EPS1", "motor power", "W", 100],
  ["FS1", "volume flow primary", "l/min", 10],
  ["FS2", "volume flow secondary", "l/min", 10],
  ["TS1", "temperature inlet", "°C", 1],
  ["TS2", "temperature outlet", "°C", 1],
  ["TS3", "temperature cooling", "°C", 1],
  ["TS4", "temperature tank", "°C", 1],
  ["VS1", "vibration", "mm/s", 1],
  ["CE", "cooling efficiency", "%", 1],
  ["CP", "cooling power", "kW", 1],
  ["SE", "efficiency factor", "%", 1]
] as const;

const rows = (text: string) => text.trim().split(/\r?\n/);
const values = (line: string) => line.trim().split(/\s+/).map(Number);
function statistic(
  id: string,
  measurement: string,
  unit: string,
  samples: number[]
): SensorStatistic {
  if (!samples.length || samples.some((value) => !Number.isFinite(value)))
    throw new Error(`Invalid ${id} samples`);
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;
  return {
    sensorId: id,
    measurement,
    unit,
    mean: +mean.toFixed(5),
    minimum: +Math.min(...samples).toFixed(5),
    maximum: +Math.max(...samples).toFixed(5),
    standardDeviation: +Math.sqrt(variance).toFixed(5),
    samples: samples.length
  };
}

const profileLines = rows(await readFile(path.join(rawDirectory, "profile.txt"), "utf8"));
if (profileLines.length !== 2205)
  throw new Error(`Expected 2205 profiles, found ${profileLines.length}`);
const sensorRows = new Map<string, string[]>();
for (const [id] of sensors) {
  const lines = rows(await readFile(path.join(rawDirectory, `${id}.txt`), "utf8"));
  if (lines.length !== 2205) throw new Error(`${id}: expected 2205 cycles, found ${lines.length}`);
  sensorRows.set(id, lines);
}
const cycles: HydraulicCycle[] = profileLines.map((line, index) => {
  const [coolerEfficiency, valveCondition, leakage, accumulatorPressure, stableFlag] = values(line);
  if (![0, 1, 2].includes(leakage!)) throw new Error(`Cycle ${index + 1}: invalid leakage label`);
  return {
    cycle: index + 1,
    durationSeconds: 60,
    conditions: {
      coolerEfficiency: coolerEfficiency!,
      valveCondition: valveCondition!,
      pumpLeakage: leakage as 0 | 1 | 2,
      accumulatorPressure: accumulatorPressure!,
      stable: stableFlag === 0
    },
    sensors: Object.fromEntries(
      sensors.map(([id, measurement, unit]) => [
        id,
        statistic(id, measurement, unit, values(sensorRows.get(id)![index]!))
      ])
    )
  };
});
const healthy = cycles.filter(
  (cycle) => cycle.conditions.pumpLeakage === 0 && cycle.conditions.stable
);
const healthyBaseline = Object.fromEntries(
  sensors.map(([id]) => [
    id,
    +(healthy.reduce((sum, cycle) => sum + cycle.sensors[id]!.mean, 0) / healthy.length).toFixed(5)
  ])
);
const distance = (cycle: HydraulicCycle) =>
  ["PS1", "PS2", "EPS1", "FS1", "TS1", "VS1", "SE"].reduce(
    (sum, id) =>
      sum +
      Math.abs(
        (cycle.sensors[id]!.mean - healthyBaseline[id]!) / (Math.abs(healthyBaseline[id]!) || 1)
      ),
    0
  );
const choose = (leakage: 0 | 1 | 2, strongest = false) =>
  cycles
    .filter((cycle) => cycle.conditions.pumpLeakage === leakage && cycle.conditions.stable)
    .sort((a, b) => distance(a) - distance(b))[
    strongest
      ? Math.max(
          0,
          cycles.filter((c) => c.conditions.pumpLeakage === leakage && c.conditions.stable).length -
            1
        )
      : 0
  ]!.cycle;
const archivePath = path.join(root, "work", "datasets", "uci-hydraulic-system.zip");
const archiveHash = createHash("sha256")
  .update(await readFile(archivePath))
  .digest("hex");
const manifest: DatasetManifest = {
  adapter: "uci-hydraulic-system",
  schemaVersion: "1.0.0",
  generatedAt: "2026-08-12T00:00:00.000Z",
  source: {
    title: "Condition Monitoring of Hydraulic Systems",
    provider: "UCI Machine Learning Repository",
    doi: "10.24432/C5CW21",
    url: "https://archive.ics.uci.edu/dataset/447/condition+monitoring+of+hydraulic+systems",
    license: "CC BY 4.0",
    dataType: "Real experimental industrial hydraulic telemetry",
    operatingCycles: 2205,
    archiveSha256: archiveHash
  },
  context: {
    assetId: "P-204A",
    assetType: "Centrifugal / Hydraulic Pump",
    plant: "PlantMind Process Industries",
    location: "Maharashtra, India",
    simulated: true
  },
  sensors: sensors.map(([id, measurement, unit, samplingHz]) => ({
    id,
    measurement,
    unit,
    samplingHz
  })),
  healthyBaseline,
  replayCycles: {
    healthy: choose(0),
    emerging: choose(0, true),
    weak: choose(1),
    severe: choose(2, true)
  },
  cycles
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, `${JSON.stringify(manifest)}\n`, "utf8");
console.log(`Normalized ${cycles.length} real cycles to ${path.relative(root, outputFile)}.`);
