import type { Metadata } from "next";
import { InActionPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "In Action" };
export default function Page() {
  return <InActionPage />;
}
