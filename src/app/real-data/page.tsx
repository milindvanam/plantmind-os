import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Database, FlaskConical, PlayCircle } from "lucide-react";
import { Badge, Breadcrumb, Card, PageHeader, Panel, SectionHeader } from "@/components/ui";
export const metadata: Metadata = { title: "Real Data Lab" };
export default function Page() {
  return (
    <>
      <Breadcrumb items={["PlantMind", "Real Data Lab"]} />
      <PageHeader
        eyebrow="Real Data Lab"
        title="Industrial evidence, under its real identity."
        description="A bounded workspace for public industrial datasets connected through PlantMind's canonical telemetry adapter."
        actions={
          <Badge tone="real">
            <Database size={13} />
            REAL INDUSTRIAL DATA
          </Badge>
        }
      />
      <div className="page-stack">
        <Panel>
          <SectionHeader title="Equipment Health" detail="Dataset integration 01 · available" />
          <Card className="lab-dataset-card">
            <div className="lab-icon">
              <Activity />
            </div>
            <div>
              <div className="trust-row">
                <Badge tone="real">REAL DATA</Badge>
                <Badge tone="success">AVAILABLE</Badge>
              </div>
              <h2>P-204A Hydraulic Pump</h2>
              <p>
                Condition Monitoring of Hydraulic Systems · 2,205 labelled 60-second cycles · UCI
                Machine Learning Repository
              </p>
              <dl>
                <div>
                  <dt>Evidence</dt>
                  <dd>Pressure, flow, motor power, temperature, vibration and efficiency</dd>
                </div>
                <div>
                  <dt>Conditions</dt>
                  <dd>Healthy · weak leakage · severe leakage</dd>
                </div>
              </dl>
            </div>
            <Link className="button button-primary" href="/real-data/P-204A">
              Open in PlantMind <ArrowRight size={15} />
            </Link>
          </Card>
        </Panel>
        <Panel>
          <SectionHeader
            title="Existing demonstrations"
            detail="Simulated experiences remain separately available"
          />
          <div className="lab-secondary">
            <FlaskConical />
            <div>
              <strong>P-204A deterministic replay</strong>
              <p>Original simulated scenario and executive workflow.</p>
            </div>
            <Link href="/assets/P-204A">
              <PlayCircle size={17} />
              Open simulated replay
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
