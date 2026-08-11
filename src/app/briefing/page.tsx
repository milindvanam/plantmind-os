import type { Metadata } from "next";
import { BriefingPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "CEO Briefing" };
export default function Page() {
  return <BriefingPage />;
}
