import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
import { WorkspaceTabs } from "@/components/workspace-tabs";
export const metadata: Metadata = { title: "Executive Briefs · INV-204" };
export default function Page() {
  return (
    <>
      <WorkspaceTabs workspace="decisions" />
      <PrototypePage kind="executives" />
    </>
  );
}
