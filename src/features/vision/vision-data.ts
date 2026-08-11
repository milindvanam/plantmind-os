export const truthClasses = [
  "REAL SOURCE DATA",
  "TRANSFORMED DATA",
  "SIMULATED CONTEXT",
  "MODEL OUTPUT",
  "DEMO LOGIC",
  "AI-GENERATED CONTENT",
  "SOURCED EXTERNAL CONTENT"
] as const;

export type TruthClass = (typeof truthClasses)[number];

export type SectorJourney = {
  slug: string;
  sector: string;
  system: string;
  headline: string;
  situation: string;
  signals: Array<{ label: string; value: string; detail: string; truth: TruthClass }>;
  context: Array<{ title: string; detail: string; truth: TruthClass }>;
  recommendation: {
    action: string;
    rationale: string;
    owner: string;
    window: string;
    truth: TruthClass;
  };
  value: Array<{ label: string; value: string; basis: string }>;
  steps: string[];
};

export const sectorJourneys: SectorJourney[] = [
  {
    slug: "power-fgd",
    sector: "Power",
    system: "Flue Gas Desulphurisation / APC",
    headline: "Protect compliance while controlling auxiliary load",
    situation:
      "A rising absorber differential-pressure pattern is converging with slurry-pump degradation and a tighter dispatch window.",
    signals: [
      {
        label: "SO₂ removal",
        value: "96.8%",
        detail: "Illustrative DCS/SCADA tag",
        truth: "SIMULATED CONTEXT"
      },
      {
        label: "Absorber ΔP",
        value: "+11.4%",
        detail: "24-hour transformed trend",
        truth: "TRANSFORMED DATA"
      },
      {
        label: "Compliance margin",
        value: "2.1 days",
        detail: "Deterministic demo projection",
        truth: "MODEL OUTPUT"
      }
    ],
    context: [
      {
        title: "Operating envelope",
        detail: "Unit 2 at 86% load; coal sulphur band elevated for the next two deliveries.",
        truth: "SIMULATED CONTEXT"
      },
      {
        title: "Maintenance history",
        detail: "Recycle pump P-204A seal inspection is overdue by 42 operating hours.",
        truth: "SIMULATED CONTEXT"
      },
      {
        title: "Evidence linkage",
        detail:
          "Tags, work-order history and operating procedure are joined to the same equipment context.",
        truth: "DEMO LOGIC"
      }
    ],
    recommendation: {
      action:
        "Inspect P-204A during tomorrow's low-load window and rebalance absorber spray headers.",
      rationale: "The intervention preserves compliance headroom without an immediate unit derate.",
      owner: "Maintenance Director",
      window: "Tomorrow · 02:00–04:30",
      truth: "AI-GENERATED CONTENT"
    },
    value: [
      {
        label: "Avoided derate exposure",
        value: "₹18–32 lakh",
        basis: "Illustrative range; 4–7 hours at assumed contribution margin"
      },
      {
        label: "Maintenance efficiency",
        value: "₹2–4 lakh",
        basis: "Illustrative labour, access and repeat-inspection range"
      },
      {
        label: "Decision lead time",
        value: "18–30 hours",
        basis: "Demo comparison with reactive escalation"
      }
    ],
    steps: [
      "Connect priority tags and work history",
      "Validate equipment context with operations",
      "Configure governed alert and evidence rules",
      "Rehearse approval and maintenance execution",
      "Measure value and prepare scale decision"
    ]
  },
  {
    slug: "cement-bulk-material-handling",
    sector: "Cement",
    system: "Bulk Material Handling",
    headline: "Stabilise material flow before it constrains kiln output",
    situation:
      "Conveyor drive current, transfer-chute blockages and crusher feed variability indicate a developing throughput constraint.",
    signals: [
      {
        label: "Conveyor current",
        value: "+8.7%",
        detail: "Illustrative PLC/SCADA tag",
        truth: "SIMULATED CONTEXT"
      },
      {
        label: "Chute stops",
        value: "4 / shift",
        detail: "Normalised event count",
        truth: "TRANSFORMED DATA"
      },
      {
        label: "Throughput risk",
        value: "High in 36h",
        detail: "Deterministic demo projection",
        truth: "MODEL OUTPUT"
      }
    ],
    context: [
      {
        title: "Production plan",
        detail: "Clinker line requires stable limestone feed through the next 48-hour campaign.",
        truth: "SIMULATED CONTEXT"
      },
      {
        title: "Inspection evidence",
        detail: "Recent operator note identifies carryback near the secondary scraper.",
        truth: "SIMULATED CONTEXT"
      },
      {
        title: "Equipment relationship",
        detail:
          "Conveyor, crusher, chute and kiln-feed dependencies are resolved into one operating context.",
        truth: "DEMO LOGIC"
      }
    ],
    recommendation: {
      action:
        "Clean and inspect the transfer chute, tension the scraper and cap crusher feed during the planned changeover.",
      rationale:
        "A coordinated 90-minute intervention reduces blockage risk while protecting the campaign plan.",
      owner: "Maintenance Director",
      window: "Next changeover · 14:30–16:00",
      truth: "AI-GENERATED CONTENT"
    },
    value: [
      {
        label: "Protected production",
        value: "₹12–24 lakh",
        basis: "Illustrative range based on 3–6 hours of avoided constraint"
      },
      {
        label: "Avoided emergency work",
        value: "₹1.5–3 lakh",
        basis: "Illustrative contractor and overtime range"
      },
      {
        label: "Decision lead time",
        value: "24–36 hours",
        basis: "Demo comparison with threshold-only response"
      }
    ],
    steps: [
      "Connect priority conveyor and production signals",
      "Map material-flow dependencies",
      "Configure governed constraint indicators",
      "Rehearse approval and maintenance execution",
      "Measure value and prepare scale decision"
    ]
  }
];

export const connectors = [
  {
    group: "Enterprise",
    name: "SAP S/4HANA",
    detail: "Work orders, materials and maintenance history",
    status: "Planned"
  },
  {
    group: "Enterprise",
    name: "Microsoft Dynamics 365",
    detail: "Enterprise work and asset records",
    status: "Custom"
  },
  {
    group: "Industrial",
    name: "OPC UA / SCADA",
    detail: "Historian and real-time process signals",
    status: "Demo"
  },
  {
    group: "Industrial",
    name: "OSIsoft PI / AVEVA PI",
    detail: "Time-series operations data",
    status: "Planned"
  },
  {
    group: "Maintenance",
    name: "IBM Maximo",
    detail: "Assets, work orders and failure history",
    status: "Planned"
  },
  {
    group: "Maintenance",
    name: "Maintenance CSV",
    detail: "Governed batch onboarding for pilot data",
    status: "Demo"
  },
  {
    group: "Data & Knowledge",
    name: "PostgreSQL",
    detail: "Context, evidence and governed decisions",
    status: "Demo"
  },
  {
    group: "Data & Knowledge",
    name: "Documents & procedures",
    detail: "Manuals, SOPs and inspection evidence",
    status: "Custom"
  }
] as const;
