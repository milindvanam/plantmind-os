import type { Metadata } from "next";
import { HydraulicRealDataExperience } from "@/features/real-data/real-data-server";
export const metadata: Metadata = { title: "P-204A · Real Industrial Data" };
export default function Page() {
  return <HydraulicRealDataExperience />;
}
