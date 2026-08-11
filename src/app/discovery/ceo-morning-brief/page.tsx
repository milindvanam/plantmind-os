import type { Metadata } from "next";
import { CeoBriefPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "CEO Morning Brief" };
export default function Page() {
  return <CeoBriefPage />;
}
