export type IntegrationMode = "SANDBOX" | "CONNECTED_BETA";
export type ConnectorStatus = "NOT_CONFIGURED" | "VALIDATED" | "SYNCED";
export type SapObjectType =
  "FUNCTIONAL_LOCATION" | "EQUIPMENT" | "MAINTENANCE_NOTIFICATION" | "MAINTENANCE_ORDER";

export interface SapEquipmentRecord {
  id: string;
  functionalLocation: string;
  description: string;
  plant: string;
  criticality: "A" | "B" | "C";
  plantMindAssetId: string;
  mappingConfidence: number;
}

export interface SapMaintenanceDraft {
  id: string;
  equipmentId: string;
  notificationType: "M2";
  shortText: string;
  evidenceReferences: readonly string[];
  status: "DRAFT" | "APPROVED_FOR_SIMULATION";
  externalDocumentId?: string;
}

export interface ConnectorAuditEntry {
  id: string;
  actor: string;
  action: string;
  outcome: "SUCCESS" | "BLOCKED" | "INFO";
  occurredAt: string;
  detail: string;
}
