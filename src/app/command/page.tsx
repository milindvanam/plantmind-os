import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
import { WorkspaceTabs } from "@/components/workspace-tabs";
export const metadata: Metadata = { title: "Executive Command" };
export default function Page() {
  return (
    <>
      <WorkspaceTabs workspace="executive" />
      <PrototypePage kind="command" />
    </>
  );
}
