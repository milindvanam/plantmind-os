import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
export const metadata: Metadata = { title: "Asset Intelligence · P-204A" };
export default function Page() {
  return <PrototypePage kind="asset" />;
}
