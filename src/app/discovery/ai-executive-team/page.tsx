import type { Metadata } from "next";
import { AiTeamPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "AI Executive Team" };
export default function Page() {
  return <AiTeamPage />;
}
