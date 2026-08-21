"use client";

import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  Check,
  CircleAlert,
  CloudCog,
  Database,
  FileCheck2,
  KeyRound,
  Link2,
  LockKeyhole,
  Network,
  RefreshCw,
  ShieldCheck,
  TestTubeDiagonal
} from "lucide-react";
import type {
  ConnectorAuditEntry,
  ConnectorStatus,
  IntegrationMode,
  SapMaintenanceDraft
} from "./contracts";
import {
  approveSandboxDraft,
  createMaintenanceDraft,
  INITIAL_SAP_AUDIT,
  SAP_SANDBOX_EQUIPMENT
} from "./sap-sandbox";

type WorkspaceTab = "readiness" | "sap" | "mapping" | "governance";

const TABS: readonly { id: WorkspaceTab; label: string }[] = [
  { id: "readiness", label: "Beta readiness" },
  { id: "sap", label: "SAP sandbox" },
  { id: "mapping", label: "Asset mapping" },
  { id: "governance", label: "Governance" }
];

function outcomeLabel(status: ConnectorStatus) {
  if (status === "SYNCED") return "Sandbox data synchronized";
  if (status === "VALIDATED") return "Contract validated";
  return "Not configured";
}

export function BetaIntegrationWorkspace() {
  const [tab, setTab] = useState<WorkspaceTab>("readiness");
  const [mode] = useState<IntegrationMode>("SANDBOX");
  const [status, setStatus] = useState<ConnectorStatus>("NOT_CONFIGURED");
  const [draft, setDraft] = useState<SapMaintenanceDraft>();
  const [audit, setAudit] = useState<readonly ConnectorAuditEntry[]>(INITIAL_SAP_AUDIT);

  function record(action: string, detail: string) {
    setAudit((current) => [
      {
        id: `AUD-SAP-${String(current.length + 1).padStart(3, "0")}`,
        actor: "Anika Kapur · Executive Viewer",
        action,
        outcome: "SUCCESS",
        occurredAt: "2026-08-22T09:35:00+05:30",
        detail
      },
      ...current
    ]);
  }

  function validateSandbox() {
    setStatus("VALIDATED");
    record("SAP sandbox contract validated", "No network request or customer credential used.");
  }

  function synchronizeSandbox() {
    setStatus("SYNCED");
    record("SAP sandbox objects synchronized", "4 equipment records mapped into PM-01 context.");
  }

  function prepareDraft() {
    setDraft(createMaintenanceDraft());
    record("Maintenance notification drafted", "Draft remains inside PlantMind; SAP is unchanged.");
  }

  function approveDraft() {
    if (!draft) return;
    setDraft(approveSandboxDraft(draft));
    record(
      "Sandbox notification approved",
      "Generated a simulated SAP document number; no external write-back occurred."
    );
  }

  return (
    <div className="beta-connect">
      <header className="beta-connect-hero">
        <div>
          <span className="beta-connect-eyebrow">
            <Network size={15} /> BETA FOUNDATION 01
          </span>
          <h1>Connect a Plant</h1>
          <p>Prove one governed plant-to-SAP workflow before expanding the integration surface.</p>
        </div>
        <div className="beta-mode-card">
          <small>ACTIVE DATA MODE</small>
          <strong>
            <TestTubeDiagonal size={15} /> {mode}
          </strong>
          <span>No live SAP or plant connection</span>
        </div>
      </header>

      <div className="beta-connect-summary" aria-label="Beta connection summary">
        <article>
          <small>DESIGN PARTNER SCOPE</small>
          <strong>1 site · 1 line</strong>
          <span>10–25 critical assets</span>
        </article>
        <article>
          <small>SAP PROFILE</small>
          <strong>S/4HANA Sandbox</strong>
          <span>{outcomeLabel(status)}</span>
        </article>
        <article>
          <small>WRITE AUTHORITY</small>
          <strong>Human approval</strong>
          <span>External write-back blocked</span>
        </article>
        <article>
          <small>DATA CLASSIFICATION</small>
          <strong>Simulated</strong>
          <span>Provenance displayed</span>
        </article>
      </div>

      <nav className="beta-connect-tabs" aria-label="Plant connection workspace">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "readiness" && (
        <section className="beta-readiness" aria-label="Beta readiness checklist">
          <div className="beta-section-heading">
            <div>
              <span>CONTROLLED BETA</span>
              <h2>What a plant can evaluate now</h2>
            </div>
            <b>4 / 7 demonstration gates ready</b>
          </div>
          <div className="beta-readiness-grid">
            {[
              ["Deterministic plant model", "Ready", "PM-01 production, OEE and energy reconcile."],
              [
                "Observable data boundary",
                "Ready",
                "Hidden simulation ground truth remains isolated."
              ],
              [
                "SAP sandbox workflow",
                "Ready",
                "Equipment import through approved notification simulation."
              ],
              ["Evidence and audit", "Ready", "Every sandbox action is classified and recorded."],
              [
                "Customer identity and SSO",
                "Requires partner",
                "Select the customer's identity provider and roles."
              ],
              [
                "Live SAP endpoint",
                "Requires partner",
                "Authorized BTP/API endpoint and technical identity."
              ],
              [
                "Real plant telemetry",
                "Requires partner",
                "Historian, OPC UA or MQTT source and tag mapping."
              ]
            ].map(([title, state, detail]) => (
              <article key={title} className={state === "Ready" ? "ready" : "blocked"}>
                <span>
                  {state === "Ready" ? <Check size={14} /> : <LockKeyhole size={14} />}
                  {state}
                </span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
          <aside className="beta-boundary">
            <ShieldCheck size={18} />
            <p>
              <strong>Safe beta boundary:</strong> PlantMind is advisory. It does not connect to
              safety systems, issue control commands or autonomously approve SAP records.
            </p>
          </aside>
        </section>
      )}

      {tab === "sap" && (
        <section className="sap-sandbox" aria-label="SAP connector sandbox">
          <div className="beta-section-heading">
            <div>
              <span>SAP CONNECTOR PACK · V0.1</span>
              <h2>Maintenance workflow sandbox</h2>
            </div>
            <span className={`sap-connection-state ${status.toLowerCase()}`}>
              {outcomeLabel(status)}
            </span>
          </div>
          <div className="sap-flow">
            <article>
              <Boxes size={24} />
              <small>01</small>
              <strong>S/4HANA sandbox</strong>
              <span>Deterministic fixture</span>
            </article>
            <ArrowRight size={18} />
            <article>
              <CloudCog size={24} />
              <small>02</small>
              <strong>Connector contract</strong>
              <span>Read-only object model</span>
            </article>
            <ArrowRight size={18} />
            <article>
              <Database size={24} />
              <small>03</small>
              <strong>PlantMind context</strong>
              <span>Mapped assets + evidence</span>
            </article>
            <ArrowRight size={18} />
            <article>
              <FileCheck2 size={24} />
              <small>04</small>
              <strong>Governed action</strong>
              <span>Approval before write-back</span>
            </article>
          </div>
          <div className="sap-actions">
            <button onClick={validateSandbox}>
              <Link2 size={15} /> Test sandbox contract
            </button>
            <button onClick={synchronizeSandbox} disabled={status === "NOT_CONFIGURED"}>
              <RefreshCw size={15} /> Import sandbox equipment
            </button>
            <button onClick={prepareDraft} disabled={status !== "SYNCED"}>
              <FileCheck2 size={15} /> Prepare notification
            </button>
          </div>
          {draft && (
            <article className="sap-draft">
              <header>
                <div>
                  <small>PLANTMIND DRAFT · NOT IN SAP</small>
                  <h3>{draft.shortText}</h3>
                </div>
                <span>{draft.status}</span>
              </header>
              <dl>
                <div>
                  <dt>Equipment</dt>
                  <dd>{draft.equipmentId} · HX-301</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{draft.notificationType} · Breakdown / malfunction</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>{draft.evidenceReferences.length} observable references</dd>
                </div>
                <div>
                  <dt>SAP document</dt>
                  <dd>{draft.externalDocumentId ?? "Not created"}</dd>
                </div>
              </dl>
              <button onClick={approveDraft} disabled={draft.status !== "DRAFT"}>
                <ShieldCheck size={15} /> Approve simulated submission
              </button>
            </article>
          )}
          <p className="sap-disclaimer">
            <CircleAlert size={14} /> Representation only. No SAP endpoint, credential, API call or
            production write-back exists in this sandbox.
          </p>
        </section>
      )}

      {tab === "mapping" && (
        <section className="sap-mapping" aria-label="SAP asset mapping">
          <div className="beta-section-heading">
            <div>
              <span>OBJECT MAPPING</span>
              <h2>SAP equipment to PlantMind assets</h2>
            </div>
            <b>{status === "SYNCED" ? "4 mapped" : "Preview fixture"}</b>
          </div>
          <div className="sap-mapping-table" role="table" aria-label="SAP equipment mappings">
            <div role="row">
              <b role="columnheader">SAP equipment</b>
              <b role="columnheader">Functional location</b>
              <b role="columnheader">PlantMind asset</b>
              <b role="columnheader">Confidence</b>
            </div>
            {SAP_SANDBOX_EQUIPMENT.map((item) => (
              <div role="row" key={item.id}>
                <span role="cell">
                  <strong>{item.id}</strong>
                  <small>{item.description}</small>
                </span>
                <span role="cell">{item.functionalLocation}</span>
                <span role="cell">{item.plantMindAssetId}</span>
                <span role="cell">{Math.round(item.mappingConfidence * 100)}%</span>
              </div>
            ))}
          </div>
          <aside className="beta-boundary">
            <KeyRound size={18} />
            <p>
              Customer credentials will be handled server-side only. This browser workspace
              intentionally contains no secret or credential input.
            </p>
          </aside>
        </section>
      )}

      {tab === "governance" && (
        <section className="sap-governance" aria-label="Connector governance and audit">
          <div className="beta-section-heading">
            <div>
              <span>GOVERNANCE</span>
              <h2>Authority and audit trail</h2>
            </div>
            <b>{audit.length} recorded events</b>
          </div>
          <div className="governance-grid">
            <article>
              <LockKeyhole size={18} />
              <h3>Read-only first</h3>
              <p>Master and maintenance data are ingested before any write-back is considered.</p>
            </article>
            <article>
              <ShieldCheck size={18} />
              <h3>Named approval</h3>
              <p>A person approves the exact notification payload and destination.</p>
            </article>
            <article>
              <KeyRound size={18} />
              <h3>Customer-owned identity</h3>
              <p>Production credentials and scopes remain controlled by the customer.</p>
            </article>
          </div>
          <div className="audit-list">
            {audit.map((entry) => (
              <article key={entry.id}>
                <span className={entry.outcome.toLowerCase()}>{entry.outcome}</span>
                <div>
                  <strong>{entry.action}</strong>
                  <p>{entry.detail}</p>
                </div>
                <time>{entry.occurredAt.slice(0, 16).replace("T", " ")}</time>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
