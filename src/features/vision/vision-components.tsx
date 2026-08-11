import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardPlus,
  Database,
  PackageCheck,
  ShieldCheck
} from "lucide-react";
import type { SectorJourney, TruthClass } from "./vision-data";

export function TruthBadge({ truth }: { truth: TruthClass }) {
  return (
    <span className="truth-badge">
      <ShieldCheck size={11} />
      {truth}
    </span>
  );
}

export function VisionHero({
  eyebrow,
  title,
  description,
  primary,
  secondary
}: {
  eyebrow: string;
  title: string;
  description: string;
  primary?: { href: Route; label: string };
  secondary?: { href: Route; label: string };
}) {
  return (
    <header className="vision-hero">
      <div className="vision-kicker">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
      {(primary || secondary) && (
        <div className="vision-actions">
          {primary && (
            <Link className="vision-button primary" href={primary.href}>
              {primary.label}
              <ArrowRight size={16} />
            </Link>
          )}
          {secondary && (
            <Link className="vision-button" href={secondary.href}>
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export function ProcessFlow() {
  const nodes = [
    "SCADA & systems",
    "Industrial context",
    "Knowledge graph",
    "Digital twin",
    "Governed AI",
    "Recommendation",
    "Human approval",
    "Action & value"
  ];
  return (
    <div className="process-flow" aria-label="PlantMind industrial intelligence flow">
      {nodes.map((node, index) => (
        <div className="flow-node" key={node}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{node}</strong>
          {index < nodes.length - 1 && <ArrowRight aria-hidden="true" size={16} />}
        </div>
      ))}
    </div>
  );
}

export function EvidenceCard({
  title,
  detail,
  truth
}: {
  title: string;
  detail: string;
  truth: TruthClass;
}) {
  return (
    <article className="vision-card evidence-card">
      <Database size={18} />
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
        <TruthBadge truth={truth} />
      </div>
    </article>
  );
}

export function BusinessValueCard({
  label,
  value,
  basis
}: {
  label: string;
  value: string;
  basis: string;
}) {
  return (
    <article className="vision-card value-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{basis}</p>
      <TruthBadge truth="DEMO LOGIC" />
    </article>
  );
}

export function RecommendationCard({
  recommendation
}: {
  recommendation: SectorJourney["recommendation"];
}) {
  return (
    <article className="recommendation-card">
      <div className="vision-kicker">Governed recommendation</div>
      <h2>{recommendation.action}</h2>
      <p>{recommendation.rationale}</p>
      <dl>
        <div>
          <dt>Decision owner</dt>
          <dd>{recommendation.owner}</dd>
        </div>
        <div>
          <dt>Execution window</dt>
          <dd>{recommendation.window}</dd>
        </div>
      </dl>
      <TruthBadge truth={recommendation.truth} />
    </article>
  );
}

export function PilotTimeline({ steps }: { steps: string[] }) {
  return (
    <ol className="pilot-timeline">
      {steps.map((step, index) => (
        <li key={step}>
          <span>{index + 1}</span>
          <div>
            <strong>Week {index === steps.length - 1 ? "7–8" : index + 1}</strong>
            <p>{step}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SapMaintenanceHandoff() {
  const handoff = [
    { label: "Equipment mapping", value: "P-204A → FLOC-DAH-RL2-CWP-204A" },
    { label: "Notification type", value: "M2 · Malfunction report" },
    { label: "Proposed priority", value: "Priority 2 · High" },
    { label: "Execution window", value: "Today · 14:00–16:00" }
  ];

  return (
    <article className="sap-handoff">
      <header>
        <div>
          <div className="vision-kicker">Enterprise maintenance handoff</div>
          <h2>SAP S/4HANA maintenance pathway</h2>
          <p>
            PlantMind prepares a governed maintenance packet for review. SAP remains the
            authoritative system for notification and work-order records.
          </p>
        </div>
        <span className="connector-status planned">Planned connector</span>
      </header>
      <div className="sap-handoff-body">
        <div className="sap-fields">
          {handoff.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="sap-work-scope">
          <ClipboardPlus size={20} />
          <div>
            <span>Proposed work scope</span>
            <strong>Inspect bearing and seal condition; verify alignment and lubrication.</strong>
          </div>
        </div>
        <div className="sap-work-scope">
          <PackageCheck size={20} />
          <div>
            <span>Material readiness</span>
            <strong>Bearing kit and seal set shown as available for this demonstration.</strong>
          </div>
        </div>
      </div>
      <footer>
        <TruthBadge truth="SIMULATED CONTEXT" />
        <span className="simulated-action">
          <ShieldCheck size={14} /> Create SAP notification · Simulated write-back
        </span>
      </footer>
    </article>
  );
}

export function NextStep({
  eyebrow,
  title,
  detail,
  href,
  label
}: {
  eyebrow: string;
  title: string;
  detail: string;
  href: Route;
  label: string;
}) {
  return (
    <section className="next-step">
      <div>
        <div className="vision-kicker">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <Link className="vision-button primary" href={href}>
        {label}
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export function SectorJourneyView({ journey }: { journey: SectorJourney }) {
  return (
    <div className="vision-page">
      <VisionHero
        eyebrow={`${journey.sector} · ${journey.system}`}
        title={journey.headline}
        description={journey.situation}
        primary={{ href: "#pilot", label: "View pilot path" }}
        secondary={{ href: "/in-action", label: "All sector journeys" }}
      />
      <section>
        <div className="vision-section-head">
          <span>01</span>
          <div>
            <h2>See the operating signal</h2>
            <p>Illustrative signals are separated from transformed and modelled outputs.</p>
          </div>
        </div>
        <div className="signal-grid">
          {journey.signals.map((signal) => (
            <article className="signal-card" key={signal.label}>
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
              <p>{signal.detail}</p>
              <TruthBadge truth={signal.truth} />
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="vision-section-head">
          <span>02</span>
          <div>
            <h2>Resolve the industrial context</h2>
            <p>
              PlantMind connects the signal to equipment, operating plans and maintenance evidence.
            </p>
          </div>
        </div>
        <div className="vision-grid three">
          {journey.context.map((item) => (
            <EvidenceCard key={item.title} {...item} />
          ))}
        </div>
      </section>
      <section>
        <div className="vision-section-head">
          <span>03</span>
          <div>
            <h2>Move from insight to governed action</h2>
            <p>AI prepares the decision; accountable people approve and execute it.</p>
          </div>
        </div>
        <RecommendationCard recommendation={journey.recommendation} />
      </section>
      <section>
        <div className="vision-section-head">
          <span>04</span>
          <div>
            <h2>Make the value case transparent</h2>
            <p>Ranges are illustrative and expose their assumptions for pilot validation.</p>
          </div>
        </div>
        <div className="vision-grid three">
          {journey.value.map((item) => (
            <BusinessValueCard key={item.label} {...item} />
          ))}
        </div>
      </section>
      <section id="pilot">
        <div className="vision-section-head">
          <span>05</span>
          <div>
            <h2>Prove it in 6–8 weeks</h2>
            <p>
              A bounded, evidence-led pilot with simulated write-back and a clear scale decision.
            </p>
          </div>
        </div>
        <PilotTimeline steps={journey.steps} />
        <div className="pilot-guardrails">
          <CheckCircle2 size={18} />
          <p>
            <strong>Pilot guardrails:</strong> private and partner-gated; no production write-back;
            connectors remain Demo, Planned or Custom until implemented.
          </p>
        </div>
      </section>
      <NextStep
        eyebrow="Pilot conversation"
        title={`Test this ${journey.sector.toLowerCase()} decision with your operating data.`}
        detail="Define one decision, its evidence and measurable value—without replacing the systems that run the plant."
        href="/connect#pilot"
        label="Plan a focused pilot"
      />
    </div>
  );
}
