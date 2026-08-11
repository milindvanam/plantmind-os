import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BrainCircuit, Factory, Network, ShieldCheck, Wrench } from "lucide-react";
import { connectors, sectorJourneys } from "./vision-data";
import {
  BusinessValueCard,
  EvidenceCard,
  NextStep,
  PilotTimeline,
  ProcessFlow,
  RecommendationCard,
  SapMaintenanceHandoff,
  TruthBadge,
  VisionHero
} from "./vision-components";

export function BriefingPage() {
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="CEO briefing · Industrial AI in plain English"
        title="Turn fragmented plant data into decisions people can trust and execute."
        description="PlantMind OS adds an industrial context and governance layer above the systems that already run the plant. It connects signals, equipment, evidence, people and value—then makes the next decision clear."
        primary={{ href: "/in-action", label: "See it in action" }}
        secondary={{ href: "/connect", label: "Explore connectivity" }}
      />
      <section className="briefing-thesis">
        <div>
          <div className="vision-kicker">Why now</div>
          <h2>Plants have more data than ever. The decision gap is still widening.</h2>
        </div>
        <p>
          Operational data lives across SCADA, historians, maintenance systems, documents and expert
          memory. Industrial AI becomes useful when that fragmented evidence is contextualised,
          governed and delivered inside a real workflow—not as another isolated dashboard.
        </p>
      </section>
      <section>
        <div className="vision-section-head">
          <span>01</span>
          <div>
            <h2>SCADA runs the process. Industrial intelligence connects the decision.</h2>
            <p>
              PlantMind respects SCADA as the control and visibility foundation; it does not claim
              to replace it.
            </p>
          </div>
        </div>
        <div className="comparison-grid">
          <article>
            <span>SCADA / DCS</span>
            <h3>Control, alarms and process visibility</h3>
            <p>Provides real-time operating signals and safe control of the physical process.</p>
          </article>
          <article>
            <span>PlantMind OS</span>
            <h3>Context, evidence and governed action</h3>
            <p>
              Links signals to business impact, maintenance history, procedures, recommendations,
              approvals and outcomes.
            </p>
          </article>
        </div>
      </section>
      <section>
        <div className="vision-section-head">
          <span>02</span>
          <div>
            <h2>From source signal to measurable value</h2>
            <p>
              Each layer preserves provenance and exposes where simulation or AI enters the story.
            </p>
          </div>
        </div>
        <ProcessFlow />
      </section>
      <section>
        <div className="vision-section-head">
          <span>03</span>
          <div>
            <h2>What leaders gain</h2>
            <p>A shared decision picture from frontline execution to corporate strategy.</p>
          </div>
        </div>
        <div className="vision-grid three">
          <BusinessValueCard
            label="Faster decisions"
            value="Hours, not days"
            basis="Target to validate during a bounded pilot"
          />
          <BusinessValueCard
            label="Protected operations"
            value="₹12–32 lakh"
            basis="Illustrative range across the two flagship scenarios"
          />
          <BusinessValueCard
            label="Governed execution"
            value="Human approved"
            basis="Recommendations retain evidence, owner and audit trail"
          />
        </div>
      </section>
      <section>
        <div className="vision-section-head">
          <span>04</span>
          <div>
            <h2>The market is moving from copilots to operational agents</h2>
            <p>
              External direction is included as sourced context—not as proof of PlantMind
              capability.
            </p>
          </div>
        </div>
        <div className="vision-grid three">
          <EvidenceCard
            title="Contextual industrial data"
            detail="Leading industrial platforms organise fragmented operational data into connected models for trusted workflows."
            truth="SOURCED EXTERNAL CONTENT"
          />
          <EvidenceCard
            title="Domain-specific AI agents"
            detail="Industrial agents increasingly combine live signals, history and procedures to support diagnosis and action."
            truth="SOURCED EXTERNAL CONTENT"
          />
          <EvidenceCard
            title="Frontline action layers"
            detail="The interface is moving closer to daily work: recommendations, approvals and execution in one governed flow."
            truth="SOURCED EXTERNAL CONTENT"
          />
        </div>
        <p className="source-note">
          Directional synthesis for this private preview. Source links and publication dates must be
          validated before external publication.
        </p>
      </section>
      <NextStep
        eyebrow="CEO takeaway"
        title="The opportunity is not another dashboard. It is a governed decision system."
        detail="Follow two authentic sector journeys from operating signal to approved action and value."
        href="/in-action"
        label="Enter In Action"
      />
    </div>
  );
}

export function InActionPage() {
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="In Action · Two flagship journeys"
        title="See one decision travel from plant signal to accountable action."
        description="Explore complete, deterministic scenarios for Power + FGD/APC and Cement + Bulk Material Handling. Every output is visibly classified so the demonstration never outruns the evidence."
      />
      <div className="journey-selector">
        {sectorJourneys.map((journey, index) => (
          <Link
            href={
              `/in-action/${journey.slug}` as
                "/in-action/power-fgd" | "/in-action/cement-bulk-material-handling"
            }
            className="journey-card"
            key={journey.slug}
          >
            <div className="journey-index">0{index + 1}</div>
            <div>
              <span>{journey.sector}</span>
              <h2>{journey.system}</h2>
              <p>{journey.situation}</p>
              <strong>
                Explore journey <ArrowRight size={15} />
              </strong>
            </div>
          </Link>
        ))}
      </div>
      <section className="truth-legend">
        <div>
          <ShieldCheck size={19} />
          <h2>Truth is part of the interface</h2>
        </div>
        <p>
          Source facts, transformations, simulations, models, demo rules and AI-generated content
          remain distinguishable at the point of use.
        </p>
        <div className="truth-list">
          {[
            "REAL SOURCE DATA",
            "TRANSFORMED DATA",
            "SIMULATED CONTEXT",
            "MODEL OUTPUT",
            "DEMO LOGIC",
            "AI-GENERATED CONTENT",
            "SOURCED EXTERNAL CONTENT"
          ].map((item) => (
            <TruthBadge key={item} truth={item as never} />
          ))}
        </div>
      </section>
      <NextStep
        eyebrow="Next lens"
        title="Start the day with the decision, not the dashboard."
        detail="See how the CEO Morning Brief compresses operational signals into a governed executive agenda."
        href="/discovery/ceo-morning-brief"
        label="Open CEO Morning Brief"
      />
    </div>
  );
}

export function ConnectPage() {
  const groups = ["Enterprise", "Industrial", "Maintenance", "Data & Knowledge"];
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="Connect · No rip and replace"
        title="Bring existing industrial systems into one governed decision context."
        description="PlantMind is designed to connect selectively, prove value with a bounded scope and preserve each source system's role. Catalog status is explicit: Demo, Planned or Custom."
        primary={{ href: "#pilot", label: "View pilot approach" }}
      />
      {groups.map((group) => (
        <section key={group}>
          <div className="vision-section-head">
            <span>
              <Network size={18} />
            </span>
            <div>
              <h2>{group}</h2>
              <p>Representative connection paths for the PlantMind architecture baseline.</p>
            </div>
          </div>
          <div className="connector-grid">
            {connectors
              .filter((item) => item.group === group)
              .map((item) => (
                <article className="connector-card" key={item.name}>
                  <div>
                    <h3>{item.name}</h3>
                    <span className={`connector-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                  <p>{item.detail}</p>
                  <small>No live production connection claimed</small>
                </article>
              ))}
          </div>
        </section>
      ))}
      <section id="pilot">
        <div className="vision-section-head">
          <span>05</span>
          <div>
            <h2>Start with a focused 6–8 week pilot</h2>
            <p>One decision, a bounded data surface and measurable operating value.</p>
          </div>
        </div>
        <PilotTimeline
          steps={[
            "Confirm decision and accountable owner",
            "Profile available signals and records",
            "Build and validate operating context",
            "Configure recommendations and evidence",
            "Run a governed shadow workflow",
            "Review value and scale decision"
          ]}
        />
        <div className="pilot-guardrails">
          <ShieldCheck size={18} />
          <p>
            <strong>Engagement posture:</strong> private / partner-gated preview. Ducon is not
            presented as a customer or partner; it may only be discussed as a prospective design
            partner or beta participant.
          </p>
        </div>
      </section>
      <NextStep
        eyebrow="Guided discovery"
        title="See how connected context changes the executive morning."
        detail="Move from connector architecture to a decision-ready brief grounded in the P-204A golden thread."
        href="/discovery/ceo-morning-brief"
        label="Open CEO Morning Brief"
      />
    </div>
  );
}

const p204Recommendation = {
  action: "Approve a controlled inspection of P-204A in the next protected operating window.",
  rationale:
    "A deterministic replay combines elevated vibration, thermal drift and overdue inspection context. Validate condition before a forced outage develops.",
  owner: "Maintenance Director",
  window: "Today · 14:00–16:00",
  truth: "AI-GENERATED CONTENT" as const
};

export function CeoBriefPage() {
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="CEO Morning Brief · 07:30 IST"
        title="Three decisions deserve leadership attention today."
        description="A concise, evidence-linked agenda. This private preview uses deterministic simulated context and does not represent live plant data."
        primary={{ href: "/discovery/predict-equipment-failure", label: "Investigate P-204A" }}
        secondary={{ href: "/command", label: "Open operational command" }}
      />
      <div className="executive-kpis">
        <article>
          <span>Value at risk</span>
          <strong>₹18–32 lakh</strong>
          <small>Illustrative range</small>
        </article>
        <article>
          <span>Decisions due</span>
          <strong>3</strong>
          <small>Before end of shift</small>
        </article>
        <article>
          <span>Evidence coverage</span>
          <strong>92%</strong>
          <small>Demo completeness score</small>
        </article>
        <article>
          <span>Safety overrides</span>
          <strong>0</strong>
          <small>Human approval retained</small>
        </article>
      </div>
      <section>
        <div className="vision-section-head">
          <span>01</span>
          <div>
            <h2>Priority decision · Cooling Water Pump P-204A</h2>
            <p>
              Degradation is developing inside a maintenance window that can still be controlled.
            </p>
          </div>
        </div>
        <RecommendationCard recommendation={p204Recommendation} />
      </section>
      <section>
        <div className="vision-grid three">
          <EvidenceCard
            title="Operations"
            detail="Vibration and bearing-temperature drift persist across the deterministic replay."
            truth="TRANSFORMED DATA"
          />
          <EvidenceCard
            title="Maintenance"
            detail="Seal inspection is overdue by 42 operating hours in the demonstration context."
            truth="SIMULATED CONTEXT"
          />
          <EvidenceCard
            title="Business impact"
            detail="An unplanned interruption exposes an illustrative ₹18–32 lakh range."
            truth="DEMO LOGIC"
          />
        </div>
      </section>
      <NextStep
        eyebrow="Deep dive"
        title="Why does PlantMind believe P-204A needs attention?"
        detail="Inspect the signal chain, context, transparent demo logic and governed recommendation."
        href="/discovery/predict-equipment-failure"
        label="Open failure prediction"
      />
    </div>
  );
}

export function PredictFailurePage() {
  const stages = [
    {
      title: "Vibration trend",
      detail: "Replay rises from 3.1 to 6.8 mm/s across the scenario window.",
      truth: "TRANSFORMED DATA" as const
    },
    {
      title: "Thermal corroboration",
      detail: "Bearing temperature drifts 9.4°C above the replay baseline.",
      truth: "TRANSFORMED DATA" as const
    },
    {
      title: "Maintenance context",
      detail: "Inspection timing and prior seal note increase operational relevance.",
      truth: "SIMULATED CONTEXT" as const
    },
    {
      title: "Risk classification",
      detail: "Deterministic thresholds classify near-term degradation risk as high.",
      truth: "MODEL OUTPUT" as const
    }
  ];
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="Predict Equipment Failure · P-204A golden thread"
        title="A transparent prediction is a chain of evidence—not a magic score."
        description="This is an immersive deterministic demonstration. It does not use a trained production model and makes no real-ML performance claim. NASA C-MAPSS remains a future dataset target for model-development work."
        primary={{ href: "/assets/P-204A", label: "Open existing asset view" }}
      />
      <section className="model-disclosure">
        <BrainCircuit size={24} />
        <div>
          <h2>How this preview works</h2>
          <p>
            Fixed replay data passes through explainable thresholds and context rules. The interface
            labels transformed inputs, simulated context, model-like output and AI-authored
            narrative separately.
          </p>
        </div>
        <TruthBadge truth="DEMO LOGIC" />
      </section>
      <section>
        <div className="vision-section-head">
          <span>01</span>
          <div>
            <h2>Evidence chain</h2>
            <p>
              Each step can be inspected and challenged before a recommendation reaches an approver.
            </p>
          </div>
        </div>
        <div className="evidence-chain">
          {stages.map((stage, index) => (
            <div key={stage.title}>
              <span>0{index + 1}</span>
              <EvidenceCard {...stage} />
            </div>
          ))}
        </div>
      </section>
      <RecommendationCard recommendation={p204Recommendation} />
      <section>
        <div className="vision-section-head">
          <span>02</span>
          <div>
            <h2>Prepare the SAP maintenance handoff</h2>
            <p>
              The approved decision becomes a structured notification proposal while SAP remains the
              maintenance system of record.
            </p>
          </div>
        </div>
        <SapMaintenanceHandoff />
      </section>
      <section>
        <div className="vision-section-head">
          <span>03</span>
          <div>
            <h2>What changes in maintenance execution</h2>
            <p>
              The output becomes a governed work decision with owner, window, evidence and outcome
              capture.
            </p>
          </div>
        </div>
        <div className="comparison-grid">
          <article>
            <span>Before</span>
            <h3>Threshold → alarm → manual investigation</h3>
            <p>
              Evidence is gathered across screens, documents and conversations before work can be
              approved.
            </p>
          </article>
          <article>
            <span>With PlantMind</span>
            <h3>Context → recommendation → approval</h3>
            <p>
              The decision package is assembled in advance; write-back remains simulated in this
              preview.
            </p>
          </article>
        </div>
      </section>
      <NextStep
        eyebrow="Decision ownership"
        title="Meet the two AI roles supporting this decision."
        detail="Each role has a bounded mandate, required evidence and a human decision boundary."
        href="/discovery/ai-executive-team"
        label="Open AI Executive Team"
      />
    </div>
  );
}

export function AiTeamPage() {
  const roles = [
    {
      icon: Wrench,
      title: "Maintenance Director AI",
      mandate: "Prepare safe, evidence-backed maintenance decisions and execution plans.",
      inputs: "Condition signals, asset context, history, procedures and operating window",
      outputs: "Recommendation, evidence packet, work scope and expected outcome",
      boundary: "Cannot approve work, change controls or write to production systems."
    },
    {
      icon: Factory,
      title: "CEO Strategy AI",
      mandate: "Translate operational decisions into enterprise risk, value and scale priorities.",
      inputs: "Governed plant decisions, value ranges, constraints and portfolio context",
      outputs: "Morning brief, scenario comparison and investment questions",
      boundary: "Cannot make capital commitments or present simulated value as realised value."
    }
  ];
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow="AI Executive Team · Two bounded roles"
        title="Specialised agents prepare decisions. Accountable leaders remain in control."
        description="PlantMind’s preview intentionally limits the team to two roles with explicit mandates, evidence requirements and authority boundaries."
      />
      <div className="ai-role-grid">
        {roles.map(({ icon: Icon, ...role }) => (
          <article className="ai-role-card" key={role.title}>
            <div className="role-icon">
              <Icon size={24} />
            </div>
            <div className="vision-kicker">Governed AI role</div>
            <h2>{role.title}</h2>
            <p>{role.mandate}</p>
            <dl>
              <div>
                <dt>Reads</dt>
                <dd>{role.inputs}</dd>
              </div>
              <div>
                <dt>Prepares</dt>
                <dd>{role.outputs}</dd>
              </div>
              <div>
                <dt>Authority boundary</dt>
                <dd>{role.boundary}</dd>
              </div>
            </dl>
            <TruthBadge truth="AI-GENERATED CONTENT" />
          </article>
        ))}
      </div>
      <section className="human-control">
        <ShieldCheck size={25} />
        <div>
          <h2>Human control is structural, not a disclaimer.</h2>
          <p>
            Recommendations preserve evidence, assumptions, decision owner and approval state.
            Production write-back is simulated; safety and operating authority remain with
            designated plant personnel.
          </p>
        </div>
      </section>
      <NextStep
        eyebrow="From preview to proof"
        title="Choose one decision and prove its value in 6–8 weeks."
        detail="The sector pilot path scopes data, validates context, rehearses governance and measures an explicit outcome."
        href={"/in-action/power-fgd" as Route}
        label="View pilot journey"
      />
    </div>
  );
}
