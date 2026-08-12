import type { Metadata } from "next";
import { ExecutiveOverview } from "@/features/overview/executive-overview";

export const metadata: Metadata = {
  title: "Executive Overview",
  description: "A seven-chapter introduction to PlantMind industrial intelligence."
};

export default function Page() {
  return <ExecutiveOverview />;
}
