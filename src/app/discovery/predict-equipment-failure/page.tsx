import type { Metadata } from "next";
import { PredictFailurePage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "Predict Equipment Failure" };
export default function Page() {
  return <PredictFailurePage />;
}
