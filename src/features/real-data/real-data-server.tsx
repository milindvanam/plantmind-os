import {
  assessHydraulicCycle,
  getHydraulicManifest,
  getHydraulicReplay
} from "./hydraulic-adapter";
import { RealDataExperience } from "./real-data-experience";

export function HydraulicRealDataExperience() {
  const sourceManifest = getHydraulicManifest();
  const manifest = {
    adapter: sourceManifest.adapter,
    schemaVersion: sourceManifest.schemaVersion,
    generatedAt: sourceManifest.generatedAt,
    source: sourceManifest.source,
    context: sourceManifest.context,
    sensors: sourceManifest.sensors,
    healthyBaseline: sourceManifest.healthyBaseline,
    replayCycles: sourceManifest.replayCycles
  };
  const replay = getHydraulicReplay().map((item) => ({
    ...item,
    assessment: assessHydraulicCycle(item.cycle)
  }));
  return <RealDataExperience manifest={manifest} replay={replay} />;
}
