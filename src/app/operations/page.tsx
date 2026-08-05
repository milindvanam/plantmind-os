import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
export const metadata: Metadata = { title: "Plant Operations" };
export default function Page() {
  return <PrototypePage kind="operations" />;
}
