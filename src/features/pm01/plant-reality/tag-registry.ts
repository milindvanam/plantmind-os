import type { Pm01OperatingBand, Pm01TagDataType, Pm01TagDefinition } from "../contracts/tag";
import { PM01_ASSETS } from "./asset-registry";

type TagOptions = Readonly<{
  dataType?: Pm01TagDataType;
  normal?: Pm01OperatingBand;
  warning?: Pm01OperatingBand;
  alarm?: Pm01OperatingBand;
  interval?: number;
}>;

const tag = (
  assetId: string,
  suffix: string,
  name: string,
  measurement: string,
  engineeringUnit: string,
  options: TagOptions = {}
): Pm01TagDefinition => ({
  id: `${assetId.replaceAll("-", "")}_${suffix}`,
  assetId,
  name,
  description: `${name} for ${assetId}`,
  measurement,
  engineeringUnit,
  dataType: options.dataType ?? "number",
  normalRange: options.normal ?? null,
  warningRange: options.warning ?? null,
  alarmRange: options.alarm ?? null,
  samplingIntervalSeconds: options.interval ?? 10
});

const processTemperature = {
  normal: { minimum: 20, maximum: 160 },
  warning: { minimum: 10, maximum: 175 },
  alarm: { minimum: 0, maximum: 190 }
} as const;
const percent = { normal: { minimum: 0, maximum: 100 } } as const;

export const PM01_TAGS: readonly Pm01TagDefinition[] = [
  tag("R-301", "TEMP", "Reactor temperature", "temperature", "°C", processTemperature),
  tag("R-301", "PRESS", "Reactor pressure", "pressure", "bar", {
    normal: { minimum: 1, maximum: 8 }
  }),
  tag("R-301", "LEVEL", "Reactor level", "level", "%", percent),
  tag("R-301", "FEED_FLOW", "Reactor feed flow", "flow", "t/hour"),
  tag("R-301", "PRODUCT_FLOW", "Reactor product flow", "flow", "t/hour"),
  tag("R-301", "PH", "Reactor pH", "pH", "pH"),
  tag("R-301", "REACTION_TIME", "Reaction elapsed time", "duration", "minute", { interval: 60 }),
  tag("R-301", "BATCH_PHASE", "Batch phase", "state", "state", { dataType: "state", interval: 60 }),
  tag(
    "R-301",
    "JACKET_IN_TEMP",
    "Jacket inlet temperature",
    "temperature",
    "°C",
    processTemperature
  ),
  tag(
    "R-301",
    "JACKET_OUT_TEMP",
    "Jacket outlet temperature",
    "temperature",
    "°C",
    processTemperature
  ),
  tag("R-301", "TEMP_SP", "Temperature setpoint", "setpoint", "°C", processTemperature),
  tag("R-301", "TEMP_ERROR", "Temperature error", "control_error", "°C"),
  tag(
    "HX-301",
    "PROCESS_IN_TEMP",
    "Process inlet temperature",
    "temperature",
    "°C",
    processTemperature
  ),
  tag(
    "HX-301",
    "PROCESS_OUT_TEMP",
    "Process outlet temperature",
    "temperature",
    "°C",
    processTemperature
  ),
  tag("HX-301", "CW_IN_TEMP", "Cooling-water inlet temperature", "temperature", "°C"),
  tag("HX-301", "CW_OUT_TEMP", "Cooling-water outlet temperature", "temperature", "°C"),
  tag("HX-301", "PROCESS_FLOW", "Process flow", "flow", "t/hour"),
  tag("HX-301", "CW_FLOW", "Cooling-water flow", "flow", "m³/hour"),
  tag("HX-301", "DP_PROCESS", "Process differential pressure", "differential_pressure", "bar"),
  tag("HX-301", "DP_CW", "Cooling differential pressure", "differential_pressure", "bar"),
  tag("CV-301", "COMMAND", "Valve command", "command", "%", percent),
  tag("CV-301", "POSITION", "Valve actual position", "position", "%", percent),
  tag("CV-301", "TRAVEL", "Valve travel", "travel", "%/minute"),
  tag("P-301A", "STATUS", "Pump status", "state", "state", { dataType: "state" }),
  tag("P-301A", "SUCTION_PRESS", "Suction pressure", "pressure", "bar"),
  tag("P-301A", "DISCH_PRESS", "Discharge pressure", "pressure", "bar"),
  tag("P-301A", "FLOW", "Pump flow", "flow", "m³/hour"),
  tag("P-301A", "VIBRATION", "Pump vibration", "vibration", "mm/s RMS"),
  tag("P-301A", "BEARING_TEMP", "Bearing temperature", "temperature", "°C"),
  tag("P-301A", "MOTOR_CURRENT", "Motor current", "current", "A"),
  tag("P-301A", "MOTOR_POWER", "Motor power", "power", "kW"),
  tag("P-301A", "SPEED", "Pump speed", "speed", "rpm"),
  tag("P-301B", "STATUS", "Pump status", "state", "state", { dataType: "state" }),
  tag("P-301B", "FLOW", "Pump flow", "flow", "m³/hour"),
  tag("P-301B", "VIBRATION", "Pump vibration", "vibration", "mm/s RMS"),
  tag("P-301B", "BEARING_TEMP", "Bearing temperature", "temperature", "°C"),
  tag("P-301B", "MOTOR_POWER", "Motor power", "power", "kW"),
  tag("CT-801", "CW_SUPPLY_TEMP", "Cooling-water supply temperature", "temperature", "°C"),
  tag("CT-801", "CW_RETURN_TEMP", "Cooling-water return temperature", "temperature", "°C"),
  tag("CT-801", "AMBIENT_TEMP", "Ambient temperature", "temperature", "°C", { interval: 60 }),
  tag("CT-801", "FAN_SPEED", "Cooling-tower fan speed", "speed", "rpm"),
  tag("CT-801", "FAN_POWER", "Cooling-tower fan power", "power", "kW"),
  tag("BLR-801", "STEAM_PRESS", "Steam pressure", "pressure", "bar"),
  tag("BLR-801", "STEAM_FLOW", "Steam flow", "flow", "t/hour"),
  tag("BLR-801", "FUEL_FLOW", "Boiler fuel flow", "flow", "kg/hour"),
  tag("BLR-801", "EFFICIENCY", "Boiler efficiency", "efficiency", "%", percent),
  tag("PKG-701", "STATUS", "Packaging status", "state", "state", { dataType: "state" }),
  tag("PKG-701", "RATE", "Packaging rate", "production_rate", "t/hour"),
  tag("PKG-701", "SPEED", "Packaging line speed", "speed", "pack/minute"),
  tag("PKG-701", "STOP_COUNT", "Stop count", "count", "count", { interval: 60 }),
  tag("PKG-701", "MICROSTOP_DURATION", "Micro-stop duration", "duration", "second", {
    interval: 60
  }),
  tag("PKG-701", "REJECT_COUNT", "Reject count", "count", "count", { interval: 60 }),
  tag("MX-201", "TEMP", "Mixer temperature", "temperature", "°C"),
  tag("MX-201", "LEVEL", "Mixer level", "level", "%", percent),
  tag("MX-201", "AGITATOR_RPM", "Mixer agitator speed", "speed", "rpm"),
  tag("MX-201", "MOTOR_POWER", "Mixer motor power", "power", "kW"),
  tag("MX-201", "BATCH_STATE", "Mixer batch state", "state", "state", {
    dataType: "state",
    interval: 60
  }),
  tag("TK-101", "LEVEL", "RM-A tank level", "level", "%", { ...percent, interval: 60 }),
  tag("TK-101", "TEMP", "RM-A temperature", "temperature", "°C", { interval: 60 }),
  tag("TK-101", "OUT_FLOW", "RM-A outlet flow", "flow", "t/hour"),
  tag("TK-102", "LEVEL", "RM-B tank level", "level", "%", { ...percent, interval: 60 }),
  tag("TK-102", "TEMP", "RM-B temperature", "temperature", "°C", { interval: 60 }),
  tag("TK-102", "OUT_FLOW", "RM-B outlet flow", "flow", "t/hour"),
  tag("TK-102", "DENSITY", "RM-B density", "density", "kg/m³", { interval: 60 }),
  tag("TK-103", "LEVEL", "RM-C tank level", "level", "%", { ...percent, interval: 60 }),
  tag("TK-103", "TEMP", "RM-C temperature", "temperature", "°C", { interval: 60 }),
  tag("TK-103", "OUT_FLOW", "RM-C outlet flow", "flow", "t/hour"),
  tag("SEP-401", "LEVEL", "Separator level", "level", "%", percent),
  tag("SEP-401", "PRESS", "Separator pressure", "pressure", "bar"),
  tag("SEP-401", "FEED_FLOW", "Separator feed flow", "flow", "t/hour"),
  tag("SEP-401", "PRODUCT_FLOW", "Separator product flow", "flow", "t/hour"),
  tag("F-401", "DP", "Filter differential pressure", "differential_pressure", "bar"),
  tag("F-401", "FLOW", "Filter flow", "flow", "t/hour"),
  tag("F-401", "AGE", "Filter age", "duration", "hour", { interval: 300 }),
  tag("DR-501", "IN_TEMP", "Dryer inlet temperature", "temperature", "°C"),
  tag("DR-501", "OUT_TEMP", "Dryer outlet temperature", "temperature", "°C"),
  tag("DR-501", "POWER", "Dryer power", "power", "kW"),
  tag("DR-501", "THROUGHPUT", "Dryer throughput", "production_rate", "t/hour"),
  tag("CMP-801", "PRESS", "Compressed-air pressure", "pressure", "bar"),
  tag("CMP-801", "FLOW", "Compressed-air flow", "flow", "Nm³/hour"),
  tag("CMP-801", "POWER", "Compressor power", "power", "kW"),
  tag("CMP-801", "LOAD", "Compressor load", "load", "%", percent)
] as const;

export function validateTagRegistry(tags: readonly Pm01TagDefinition[] = PM01_TAGS) {
  const assetIds = new Set(PM01_ASSETS.map((asset) => asset.id));
  const tagIds = new Set<string>();
  for (const definition of tags) {
    if (tagIds.has(definition.id)) throw new Error(`Duplicate PM-01 tag ID: ${definition.id}`);
    if (!assetIds.has(definition.assetId))
      throw new Error(`PM-01 tag ${definition.id} has unknown asset ${definition.assetId}`);
    if (
      !Number.isInteger(definition.samplingIntervalSeconds) ||
      definition.samplingIntervalSeconds <= 0
    )
      throw new Error(`PM-01 tag ${definition.id} has invalid sampling interval`);
    tagIds.add(definition.id);
  }
  return { tagCount: tags.length, tagIds } as const;
}

export function getPm01Tag(tagId: string) {
  return PM01_TAGS.find((definition) => definition.id === tagId) ?? null;
}
