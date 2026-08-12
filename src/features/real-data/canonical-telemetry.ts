export type DataMode = "SIMULATED_DATA" | "REAL_DATA";
export type HealthState = "healthy" | "watch" | "critical";
export type PumpLeakage = 0 | 1 | 2;

export type SensorStatistic = {
  sensorId: string;
  measurement: string;
  unit: string;
  mean: number;
  minimum: number;
  maximum: number;
  standardDeviation: number;
  samples: number;
};

export type HydraulicCycle = {
  cycle: number;
  durationSeconds: 60;
  conditions: {
    coolerEfficiency: number;
    valveCondition: number;
    pumpLeakage: PumpLeakage;
    accumulatorPressure: number;
    stable: boolean;
  };
  sensors: Record<string, SensorStatistic>;
};

export type DatasetManifest = {
  adapter: "uci-hydraulic-system";
  schemaVersion: "1.0.0";
  generatedAt: string;
  source: {
    title: "Condition Monitoring of Hydraulic Systems";
    provider: "UCI Machine Learning Repository";
    doi: "10.24432/C5CW21";
    url: string;
    license: "CC BY 4.0";
    dataType: "Real experimental industrial hydraulic telemetry";
    operatingCycles: 2205;
    archiveSha256: string;
  };
  context: {
    assetId: "P-204A";
    assetType: "Centrifugal / Hydraulic Pump";
    plant: "PlantMind Process Industries";
    location: "Maharashtra, India";
    simulated: true;
  };
  sensors: Array<{ id: string; measurement: string; unit: string; samplingHz: number }>;
  healthyBaseline: Record<string, number>;
  replayCycles: { healthy: number; emerging: number; weak: number; severe: number };
  cycles: HydraulicCycle[];
};

export type HealthAssessment = {
  state: HealthState;
  label: string;
  reason: string;
  confidence: number;
  leakage: PumpLeakage;
  stable: boolean;
  supportingSignals: Array<{
    sensorId: string;
    label: string;
    value: number;
    unit: string;
    baseline: number;
    deviationPercent: number;
  }>;
};
