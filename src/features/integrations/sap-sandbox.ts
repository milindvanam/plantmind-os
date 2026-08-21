import type { ConnectorAuditEntry, SapEquipmentRecord, SapMaintenanceDraft } from "./contracts";

export const SAP_SANDBOX_EQUIPMENT: readonly SapEquipmentRecord[] = [
  {
    id: "10000042",
    functionalLocation: "PM01-PRD-REA",
    description: "R-301 production reactor",
    plant: "PM01",
    criticality: "A",
    plantMindAssetId: "R-301",
    mappingConfidence: 1
  },
  {
    id: "10000057",
    functionalLocation: "PM01-PRD-SEP",
    description: "S-401 primary separator",
    plant: "PM01",
    criticality: "A",
    plantMindAssetId: "S-401",
    mappingConfidence: 1
  },
  {
    id: "10000061",
    functionalLocation: "PM01-UTL-HX",
    description: "HX-301 process heat exchanger",
    plant: "PM01",
    criticality: "A",
    plantMindAssetId: "HX-301",
    mappingConfidence: 0.96
  },
  {
    id: "10000083",
    functionalLocation: "PM01-PKG-L01",
    description: "PKG-501 packaging line",
    plant: "PM01",
    criticality: "B",
    plantMindAssetId: "PKG-501",
    mappingConfidence: 0.92
  }
] as const;

const DEMO_TIME = "2026-08-22T09:30:00+05:30";

export const INITIAL_SAP_AUDIT: readonly ConnectorAuditEntry[] = [
  {
    id: "AUD-SAP-001",
    actor: "PlantMind Sandbox",
    action: "Connector profile created",
    outcome: "INFO",
    occurredAt: DEMO_TIME,
    detail: "SAP S/4HANA sandbox profile; no endpoint or credentials configured."
  }
] as const;

export function createMaintenanceDraft(): SapMaintenanceDraft {
  return {
    id: "PM-DRAFT-0001",
    equipmentId: "10000061",
    notificationType: "M2",
    shortText: "Inspect HX-301 thermal performance during protected operating window",
    evidenceReferences: ["TAG:HX301-TI-OUT", "TAG:HX301-FI-CW", "PM01:ENERGY-INTENSITY"],
    status: "DRAFT"
  };
}

export function approveSandboxDraft(draft: SapMaintenanceDraft): SapMaintenanceDraft {
  return {
    ...draft,
    status: "APPROVED_FOR_SIMULATION",
    externalDocumentId: "SIM-SAP-NOTIF-4000128"
  };
}
