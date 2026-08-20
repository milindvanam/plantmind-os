import type { Metadata } from "next";
import { WorkspaceTabs } from "@/components/workspace-tabs";
import { BriefingPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "CEO Briefing" };
export default function Page() {
  return (
    <>
      <WorkspaceTabs workspace="executive" />
      <BriefingPage />
    </>
  );
}
