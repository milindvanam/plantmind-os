"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  CircleDollarSign,
  Database,
  Factory,
  Gauge,
  Network,
  ShieldCheck,
  Wrench
} from "lucide-react";

const chapters = [
  { number: "01", label: "The decision gap" },
  { number: "02", label: "The intelligence layer" },
  { number: "03", label: "The executive room" },
  { number: "04", label: "The early warning" },
  { number: "05", label: "The enterprise handoff" },
  { number: "06", label: "The value case" },
  { number: "07", label: "The invitation" }
] as const;

function FragmentedSystems() {
  return (
    <div className="overview-visual systems-visual" aria-hidden="true">
      <div className="system-core">
        <Factory />
        <strong>PLANT</strong>
        <span>Operating reality</span>
      </div>
      {[
        ["SCADA", "8,420 tags"],
        ["SAP", "1,284 records"],
        ["CMMS", "312 orders"],
        ["SOPs", "96 documents"]
      ].map(([name, detail], i) => (
        <div className={`orbit-system orbit-${i + 1}`} key={name}>
          <Database />
          <strong>{name}</strong>
          <span>{detail}</span>
        </div>
      ))}
      <div className="signal signal-a" />
      <div className="signal signal-b" />
      <div className="signal signal-c" />
    </div>
  );
}

function IntelligenceFlow() {
  return (
    <div className="overview-visual intelligence-visual" aria-hidden="true">
      <div className="data-stream">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="context-engine">
        <Network />
        <span>Industrial context</span>
        <strong>One connected decision picture</strong>
      </div>
      <div className="knowledge-nodes">
        {["Asset", "Signal", "Work", "Risk", "Value"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function ExecutiveRoom() {
  return (
    <div className="overview-visual boardroom-visual" aria-hidden="true">
      <div className="decision-table">
        <div className="table-screen">
          <span>DECISION 01</span>
          <strong>Protect output. Inspect P-204A.</strong>
          <small>Evidence coverage · 92%</small>
        </div>
      </div>
      <div className="leader leader-one">
        <span>CEO</span>
      </div>
      <div className="leader leader-two">
        <span>Plant Head</span>
      </div>
      <div className="leader leader-three">
        <span>Maintenance</span>
      </div>
      <div className="leader leader-four">
        <span>Operations</span>
      </div>
      <div className="deliberation">
        <ShieldCheck />
        <span>Evidence reviewed</span>
        <strong>Controlled inspection approved</strong>
      </div>
    </div>
  );
}

function FailureVisual() {
  return (
    <div className="overview-visual failure-visual" aria-hidden="true">
      <div className="pump-icon">
        <Gauge />
        <span>P-204A</span>
      </div>
      <svg viewBox="0 0 620 220">
        <path className="chart-grid" d="M20 40H600M20 90H600M20 140H600M20 190H600" />
        <path
          className="trend-line"
          d="M20 178 C100 174,120 160,180 164 S270 132,330 138 S410 104,460 112 S535 54,600 48"
        />
      </svg>
      <div className="risk-marker">
        <BrainCircuit />
        <span>DETERMINISTIC DEMO</span>
        <strong>Degradation risk · High</strong>
      </div>
    </div>
  );
}

function SapVisual() {
  return (
    <div className="overview-visual sap-overview-visual" aria-hidden="true">
      <div className="handoff-source">
        <Wrench />
        <span>PlantMind</span>
        <strong>Approved decision packet</strong>
      </div>
      <div className="handoff-track">
        <i />
        <i />
        <i />
        <ArrowRight />
      </div>
      <div className="handoff-target">
        <Building2 />
        <span>SAP S/4HANA</span>
        <strong>Maintenance notification</strong>
        <small>Planned · simulated write-back</small>
      </div>
      <div className="handoff-data">
        <span>FLOC</span>
        <strong>DAH-RL2-CWP-204A</strong>
        <span>PRIORITY</span>
        <strong>02 · High</strong>
      </div>
    </div>
  );
}

function ValueVisual() {
  return (
    <div className="overview-visual value-overview-visual" aria-hidden="true">
      <div className="value-ring">
        <CircleDollarSign />
        <span>Protected operation</span>
        <strong>₹18–32 lakh</strong>
        <small>Illustrative range</small>
      </div>
      <div className="value-metrics">
        <div>
          <span>Decision lead time</span>
          <strong>18–30h</strong>
          <i />
        </div>
        <div>
          <span>Evidence coverage</span>
          <strong>92%</strong>
          <i />
        </div>
        <div>
          <span>Human approval</span>
          <strong>Retained</strong>
          <i />
        </div>
      </div>
    </div>
  );
}

function PilotVisual() {
  return (
    <div className="overview-visual pilot-overview-visual" aria-hidden="true">
      <div className="pilot-path">
        {["Decision", "Data", "Context", "Rehearse", "Value", "Scale"].map((label, i) => (
          <div key={label}>
            <span>
              <Check />
            </span>
            <strong>{label}</strong>
            <small>{i === 5 ? "Week 8" : `Week ${i + 1}`}</small>
          </div>
        ))}
      </div>
      <div className="pilot-statement">
        <ShieldCheck />
        <div>
          <span>PRIVATE · PARTNER-GATED</span>
          <strong>One decision. Measurable proof.</strong>
        </div>
      </div>
    </div>
  );
}

const slides = [
  {
    eyebrow: "Industrial operations are data-rich",
    title: "But critical decisions still arrive fragmented.",
    body: "SCADA sees the process. SAP sees maintenance. Documents hold procedure. Experts carry context. Leadership still has to assemble the truth under pressure.",
    visual: <FragmentedSystems />
  },
  {
    eyebrow: "PlantMind OS",
    title: "One intelligence layer connects the operating reality.",
    body: "PlantMind contextualises signals, equipment, history, evidence and business impact—without replacing the systems that safely run the plant.",
    visual: <IntelligenceFlow />
  },
  {
    eyebrow: "Decision-ready leadership",
    title: "The management room deliberates on evidence, not dashboard noise.",
    body: "CEO, plant, operations and maintenance leaders review the same recommendation, assumptions and value range before accountable approval.",
    visual: <ExecutiveRoom />
  },
  {
    eyebrow: "From reaction to anticipation",
    title: "See degradation early enough to choose the intervention.",
    body: "A transparent P-204A evidence chain turns vibration, thermal drift and maintenance context into a governed inspection recommendation.",
    visual: <FailureVisual />
  },
  {
    eyebrow: "No rip and replace",
    title: "PlantMind prepares action. SAP remains the system of record.",
    body: "Approved decisions become structured maintenance packets with equipment mapping, work scope, priority and material readiness. Production write-back is simulated in this preview.",
    visual: <SapVisual />
  },
  {
    eyebrow: "Transparent business value",
    title: "Every operational decision carries an explicit value case.",
    body: "Illustrative INR ranges expose their assumptions, so a pilot can validate avoided exposure, decision lead time and execution efficiency.",
    visual: <ValueVisual />
  },
  {
    eyebrow: "A focused executive preview",
    title: "Start with one consequential decision. Prove it in 6–8 weeks.",
    body: "Explore the full product narrative, two industrial journeys, the CEO Morning Brief and the governed path from prediction to maintenance execution.",
    visual: <PilotVisual />
  }
] as const;

export function ExecutiveOverview() {
  const [active, setActive] = useState(0);
  const move = useCallback(
    (direction: number) =>
      setActive((current) => Math.min(slides.length - 1, Math.max(0, current + direction))),
    []
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)) move(1);
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);
  const slide = slides[active]!;
  const chapter = chapters[active]!;
  return (
    <main className="executive-overview">
      <header className="overview-header">
        <div className="overview-brand">
          <span className="overview-brand-mark">
            <i />
          </span>
          <div>
            <strong>PlantMind</strong>
            <small>Executive Overview</small>
          </div>
        </div>
        <div className="overview-header-actions">
          <span>Private vision preview</span>
          <Link href="/briefing">
            Skip to product <ArrowRight />
          </Link>
        </div>
      </header>
      <section className="overview-stage" key={active}>
        <div className="overview-copy">
          <span className="overview-chapter">
            {chapter.number} · {chapter.label}
          </span>
          <div className="overview-eyebrow">{slide.eyebrow}</div>
          <h1>{slide.title}</h1>
          <p>{slide.body}</p>
          {active === slides.length - 1 && (
            <Link className="overview-enter" href="/briefing">
              Enter PlantMind OS <ArrowRight />
            </Link>
          )}
        </div>
        {slide.visual}
      </section>
      <footer className="overview-controls">
        <nav aria-label="Overview chapters">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.number}
              aria-label={`Go to chapter ${index + 1}: ${chapter.label}`}
              aria-current={active === index ? "step" : undefined}
              onClick={() => setActive(index)}
            >
              <span>{chapter.number}</span>
              <i />
            </button>
          ))}
        </nav>
        <div className="overview-counter">
          <strong>{String(active + 1).padStart(2, "0")}</strong>
          <span>/ {String(slides.length).padStart(2, "0")}</span>
        </div>
        <div className="overview-arrows">
          <button onClick={() => move(-1)} disabled={active === 0} aria-label="Previous chapter">
            <ArrowLeft />
          </button>
          <button
            onClick={() => move(1)}
            disabled={active === slides.length - 1}
            aria-label="Next chapter"
          >
            <ArrowRight />
          </button>
        </div>
      </footer>
    </main>
  );
}
