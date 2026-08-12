import dataset from "../../../data/real/hydraulic-system/normalized/cycles.json";
import type { DatasetManifest, HealthAssessment, HydraulicCycle } from "./canonical-telemetry";

const manifest = dataset as unknown as DatasetManifest;
const signalDefinitions = [
  ["VS1", "Vibration"],
  ["PS1", "Primary pressure"],
  ["PS2", "Secondary pressure"],
  ["EPS1", "Motor power"],
  ["FS1", "Primary flow"],
  ["TS1", "Inlet temperature"],
  ["SE", "System efficiency"]
] as const;

export function getHydraulicManifest() {
  return manifest;
}
export function getHydraulicCycle(cycle: number) {
  const found = manifest.cycles.find((item) => item.cycle === cycle);
  if (!found) throw new Error(`UCI hydraulic cycle ${cycle} is unavailable`);
  return found;
}
export function getHydraulicReplay() {
  return (["healthy", "emerging", "weak", "severe"] as const).map((stage) => ({
    stage,
    cycle: getHydraulicCycle(manifest.replayCycles[stage])
  }));
}

export function assessHydraulicCycle(cycle: HydraulicCycle): HealthAssessment {
  const leakage = cycle.conditions.pumpLeakage;
  const isEmergingReference = cycle.cycle === manifest.replayCycles.emerging;
  const state =
    leakage === 2
      ? "critical"
      : leakage === 1 || !cycle.conditions.stable || isEmergingReference
        ? "watch"
        : "healthy";
  const supportingSignals = signalDefinitions
    .map(([sensorId, label]) => {
      const sensor = cycle.sensors[sensorId]!;
      const baseline = manifest.healthyBaseline[sensorId]!;
      return {
        sensorId,
        label,
        value: sensor.mean,
        unit: sensor.unit,
        baseline,
        deviationPercent: +(((sensor.mean - baseline) / (Math.abs(baseline) || 1)) * 100).toFixed(1)
      };
    })
    .sort((a, b) => Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent));
  const reason =
    leakage === 2
      ? "UCI labels this cycle with severe internal pump leakage; supporting telemetry is compared with stable no-leakage cycles."
      : leakage === 1
        ? "UCI labels this cycle with weak internal pump leakage; PlantMind highlights the strongest supporting deviations."
        : isEmergingReference
          ? "UCI labels this cycle stable with no internal pump leakage. PlantMind marks it as an emerging-deviation example because it has the largest aggregate signal distance from the healthy baseline among those source-labelled cycles."
          : cycle.conditions.stable
            ? "UCI labels this cycle with no internal pump leakage and stable operating conditions."
            : "UCI labels no internal pump leakage, but the system-stability flag indicates steady conditions may not yet have been reached.";
  return {
    state,
    label: state === "healthy" ? "Healthy" : state === "watch" ? "Watch" : "Critical",
    reason,
    confidence: cycle.conditions.stable ? 98 : 86,
    leakage,
    stable: cycle.conditions.stable,
    supportingSignals: supportingSignals.slice(0, 5)
  };
}

export function buildRealDataSnapshot(cycle: HydraulicCycle) {
  const assessment = assessHydraulicCycle(cycle);
  return {
    assetId: manifest.context.assetId,
    cycle,
    assessment,
    title:
      assessment.state === "healthy"
        ? "P-204A is operating within the healthy reference state"
        : "P-204A requires attention",
    summary:
      assessment.state === "healthy"
        ? "This actual UCI operating cycle is labelled stable with no internal pump leakage."
        : `Pump condition has deteriorated relative to healthy operating cycles. The source label indicates ${assessment.leakage === 2 ? "severe" : "weak"} internal leakage.`,
    recommendation:
      assessment.state === "healthy"
        ? "Continue condition monitoring and retain this cycle in the healthy comparison set."
        : "PlantMind recommends that maintenance inspect P-204A for internal leakage and verify pump efficiency, seals and associated hydraulic conditions."
  };
}
